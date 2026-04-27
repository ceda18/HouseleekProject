using System.Data;
using System.Text.Json;
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CorePlatform.src.Services;

public class AIAgentService : IAIAgentService
{
    private readonly AppDbContext _db;
    private readonly AgentDbContext _agentDb;
    private readonly ICurrentUser _currentUser;
    private readonly IMemoryCache _cache;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ISceneService _sceneService;
    private readonly IAutomationService _automationService;
    private readonly IItemService _itemService;

    private static readonly JsonSerializerOptions _agentJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    private string HistoryCacheKey => $"agent_history_{_currentUser.UserId}";

    public AIAgentService(
        AppDbContext db,
        AgentDbContext agentDb,
        ICurrentUser currentUser,
        IMemoryCache cache,
        IHttpClientFactory httpClientFactory,
        ISceneService sceneService,
        IAutomationService automationService,
        IItemService itemService)
    {
        _db = db;
        _agentDb = agentDb;
        _currentUser = currentUser;
        _cache = cache;
        _httpClientFactory = httpClientFactory;
        _sceneService = sceneService;
        _automationService = automationService;
        _itemService = itemService;
    }

    // ─── PUBLIC METHODS ──────────────────────────────────────────────────────

    /// <summary>
    /// SO46 — Builds a full snapshot of the user's smart home state,
    /// sends it to the agent service so Claude has context for the session.
    /// Returns existing in-memory history (if any) so the UI can restore the chat.
    /// </summary>
    public async Task<List<AgentMessageDto>> StartChat()
    {
        var snapshot = await BuildSnapshot();
        var body = new { user_id = _currentUser.UserId, snapshot };

        var client = _httpClientFactory.CreateClient("AgentService");
        await client.PostAsJsonAsync("/chat/start", body, _agentJsonOptions);

        return FetchHistory();
    }

    /// <summary>
    /// SO47 — Sends the user's message plus current history to the agent service.
    /// Stores both the user message and the assistant reply in the in-memory history.
    /// </summary>
    public async Task<AgentMessageDto?> SendMessage(string message)
    {
        var history = FetchHistory();

        var userMessage = new AgentMessageDto
        {
            Role = "user",
            Content = message,
            Timestamp = DateTime.UtcNow
        };
        history.Add(userMessage);

        // Send only role+content to the agent — timestamps and proposals are CorePlatform internals
        var historyForAgent = history.Select(m => new { role = m.Role, content = m.Content });
        var body = new { user_id = _currentUser.UserId, message, history = historyForAgent };

        var client = _httpClientFactory.CreateClient("AgentService");
        var response = await client.PostAsJsonAsync("/chat/message", body, _agentJsonOptions);

        if (!response.IsSuccessStatusCode) return null;

        var result = await response.Content.ReadFromJsonAsync<AgentServiceResponse>(_agentJsonOptions);
        if (result == null) return null;

        ProposalDto? proposal = null;
        if (result.Proposal != null)
        {
            proposal = new ProposalDto
            {
                Type = result.Proposal.Type,
                Payload = result.Proposal.Payload
            };
        }

        var assistantMessage = new AgentMessageDto
        {
            Role = "assistant",
            Content = result.Content,
            Timestamp = DateTime.UtcNow,
            Proposal = proposal
        };

        history.Add(assistantMessage);
        StoreHistory(history);

        return assistantMessage;
    }

    /// <summary>
    /// SO48 — Applies an agent-generated proposal by delegating to the appropriate service.
    /// The payload must match the target DTO (SceneDto / AutomationDto / ItemDto).
    /// </summary>
    public async Task<bool> ApplyProposal(ApplyProposalRequest request)
    {
        var json = request.Payload.GetRawText();

        switch (request.Type.ToLowerInvariant())
        {
            case "scene":
                var sceneDto = JsonSerializer.Deserialize<SceneDto>(json, _agentJsonOptions);
                if (sceneDto == null) return false;
                await _sceneService.PostScene(sceneDto);
                return true;

            case "automation":
                var automationDto = JsonSerializer.Deserialize<AutomationDto>(json, _agentJsonOptions);
                if (automationDto == null) return false;
                await _automationService.PostAutomation(automationDto);
                return true;

            case "item":
                var itemDto = JsonSerializer.Deserialize<ItemDto>(json, _agentJsonOptions);
                if (itemDto == null) return false;
                await _itemService.PostItem(itemDto);
                return true;

            default:
                return false;
        }
    }

    public Task<List<AgentMessageDto>> GetHistory()
        => Task.FromResult(FetchHistory());

    public async Task<bool> ClearSession()
    {
        _cache.Remove(HistoryCacheKey);

        var body = new { user_id = _currentUser.UserId };
        var client = _httpClientFactory.CreateClient("AgentService");
        var response = await client.PostAsJsonAsync("/session/clear", body, _agentJsonOptions);
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Executes a raw SELECT query via AgentDbContext (read-only DB user).
    /// Called indirectly by the agent service via POST /api/aiagent/analytics/execute.
    /// </summary>
    public async Task<List<Dictionary<string, object?>>> ExecuteAnalyticsQuery(string sql)
    {
        var trimmed = sql.Trim();
        if (!trimmed.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Only SELECT queries are permitted.");

        var connection = _agentDb.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        using var command = connection.CreateCommand();
        command.CommandText = sql;

        using var reader = await command.ExecuteReaderAsync();
        var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToList();

        var results = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>();
            foreach (var col in columns)
                row[col] = reader[col] == DBNull.Value ? null : reader[col];
            results.Add(row);
        }

        return results;
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private List<AgentMessageDto> FetchHistory()
        => _cache.Get<List<AgentMessageDto>>(HistoryCacheKey) ?? [];

    private void StoreHistory(List<AgentMessageDto> history)
    {
        var options = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromHours(2));
        _cache.Set(HistoryCacheKey, history, options);
    }

    /// <summary>
    /// Builds a JSON-serializable snapshot of the current user's smart home state.
    /// Injected into the agent's system prompt at session start.
    /// </summary>
    private async Task<object> BuildSnapshot()
    {
        var userId = _currentUser.UserId;

        var units = await _db.Units
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemStates)
                        .ThenInclude(is_ => is_.ActionDefinition)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemModel)
                        .ThenInclude(im => im.ItemCategory)
            .Where(u => u.UserId == userId)
            .ToListAsync();

        var scenes = await _db.Scenes
            .Include(s => s.SceneNavigation)
            .Where(s => s.SceneNavigation.UserId == userId)
            .ToListAsync();

        var automations = await _db.Automations
            .Include(a => a.AutomationNavigation)
            .Where(a => a.AutomationNavigation.UserId == userId)
            .ToListAsync();

        return new
        {
            userId,
            units = units.Select(u => new
            {
                unitId = u.UnitId,
                name = u.Name,
                rooms = u.Rooms.Select(r => new
                {
                    roomId = r.RoomId,
                    name = r.Name,
                    items = r.Items.Select(i => new
                    {
                        itemId = i.ItemId,
                        name = i.Name,
                        category = i.ItemModel.ItemCategory.Name,
                        states = i.ItemStates.Select(is_ => new
                        {
                            itemStateId = is_.ItemStateId,
                            actionDefinition = is_.ActionDefinition.Name,
                            valueType = is_.ActionDefinition.ValueType,
                            currentValue = is_.Value,
                            controllable = is_.ActionDefinition.Controllable
                        })
                    })
                })
            }),
            scenes = scenes.Select(s => new
            {
                sceneId = s.SceneId,
                name = s.SceneNavigation.Name
            }),
            automations = automations.Select(a => new
            {
                automationId = a.AutomationId,
                name = a.AutomationNavigation.Name
            })
        };
    }
}

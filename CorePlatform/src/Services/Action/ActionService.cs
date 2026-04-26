using System.Text.Json;
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class ActionService : IActionService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ActionService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    // ─── PUBLIC METHODS ──────────────────────────────────────────────────────

    /// <summary>
    /// SO22 — Updates item name, room, and state values.
    /// Only changed states are validated, updated, and logged.
    /// triggerType = "manual"
    /// </summary>
    public async Task<bool> PutItem(ItemDto request)
    {
        var item = await _db.Items
            .Include(i => i.ItemModel).ThenInclude(im => im.ItemCategory)
            .Include(i => i.ItemStates).ThenInclude(is_ => is_.ActionDefinition)
            .Include(i => i.Room).ThenInclude(r => r.Unit).ThenInclude(u => u.User)
            .FirstOrDefaultAsync(i => i.ItemId == request.ItemId);

        if (item == null) return false;
        if (_currentUser.Role != "admin" && item.Room.Unit.UserId != _currentUser.UserId) return false;

        var executionId = Guid.NewGuid();
        var userContext = BuildUserContext(item.Room.Unit.User);
        var logs = new List<ActionLog>();

        item.Name = request.Name;
        item.RoomId = request.RoomId;

        foreach (var requestState in request.ItemStates)
        {
            var dbState = item.ItemStates.FirstOrDefault(is_ => is_.ItemStateId == requestState.ItemStateId);
            if (dbState == null) continue;

            var newValue = requestState.Value?.ToString() ?? string.Empty;
            if (dbState.Value == newValue) continue;

            var (isValid, error) = ValueTypeValidator.Validate(newValue, dbState.ActionDefinition);
            if (!isValid) throw new ArgumentException(error);

            var pastValue = dbState.Value;
            dbState.Value = newValue;

            logs.Add(new ActionLog
            {
                ExecutionId = executionId,
                Timestamp = DateTime.UtcNow,
                TriggerSource = JsonSerializer.Serialize(BuildTriggerSource("manual", userContext, dbState, null)),
                PastValue = pastValue,
                CurrentValue = newValue,
                ItemStateId = dbState.ItemStateId,
                SmartWorkflowId = null
            });
        }

        _db.ActionLogs.AddRange(logs);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// SO33 — Executes all SmartActions of a given SmartWorkflow (Scene or Automation).
    /// Every action is logged regardless of whether the value changes.
    /// If a SmartAction points to a TargetScene, that scene's actions are executed
    /// under the same ExecutionId and parent workflow context.
    /// </summary>
    public async Task<bool> Execute(int smartWorkflowId)
    {
        var workflow = await _db.SmartWorkflows
            .Include(wf => wf.User)
            .Include(wf => wf.SmartActions)
                .ThenInclude(sa => sa.ItemState!) // nullable for TargetScene actions
                    .ThenInclude(is_ => is_.ActionDefinition)
            .Include(wf => wf.SmartActions)
                .ThenInclude(sa => sa.ItemState!) // nullable for TargetScene actions
                    .ThenInclude(is_ => is_.Item)
                        .ThenInclude(i => i.ItemModel)
                            .ThenInclude(im => im.ItemCategory)
            .Include(wf => wf.SmartActions)
                .ThenInclude(sa => sa.ItemState!) // nullable for TargetScene actions
                    .ThenInclude(is_ => is_.Item)
                        .ThenInclude(i => i.Room)
                            .ThenInclude(r => r.Unit)
            .Include(wf => wf.SmartActions)
                .ThenInclude(sa => sa.TargetScene)
                    .ThenInclude(s => s!.SceneNavigation)
            .FirstOrDefaultAsync(wf => wf.SmartWorkflowId == smartWorkflowId);

        if (workflow == null) return false;
        if (_currentUser.Role != "admin" && workflow.UserId != _currentUser.UserId) return false;

        var executionId = Guid.NewGuid();
        var workflowContext = BuildWorkflowContext(workflow);
        var userContext = BuildUserContext(workflow.User);
        var logs = new List<ActionLog>();

        await ExecuteSmartActions(
            workflow.SmartActions,
            executionId,
            workflow.Type,
            workflowContext,
            userContext,
            logs);

        _db.ActionLogs.AddRange(logs);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// SO45 — Returns all action logs ordered by most recent first.
    /// PastValue and CurrentValue are typed according to the valueType
    /// stored in each log's TriggerSource snapshot.
    /// </summary>
    public async Task<List<ActionLogDto>> GetActionLogs()
    {
        var query = _db.ActionLogs
            .OrderByDescending(l => l.Timestamp)
            .AsQueryable();

        if (_currentUser.Role != "admin")
            query = query.Where(l =>
                (l.SmartWorkflowId != null && l.SmartWorkflow!.UserId == _currentUser.UserId) ||
                (l.SmartWorkflowId == null && l.ItemState!.Item.Room.Unit.UserId == _currentUser.UserId));

        var logs = await query.ToListAsync();
        return logs.Select(MapResponse).ToList();
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

    /// <summary>
    /// Recursively executes a collection of SmartActions.
    /// TargetScene actions are resolved and executed within the same ExecutionId
    /// and attributed to the originating workflow context.
    /// </summary>
    private async Task ExecuteSmartActions(
        IEnumerable<SmartAction> smartActions,
        Guid executionId,
        string triggerType,
        object workflowContext,
        object userContext,
        List<ActionLog> logs)
    {
        foreach (var sa in smartActions)
        {
            if (sa.ItemStateId != null && sa.ItemState != null)
            {
                var (isValid, error) = ValueTypeValidator.Validate(sa.Value ?? string.Empty, sa.ItemState.ActionDefinition);
                if (!isValid) throw new ArgumentException(error);

                var pastValue = sa.ItemState.Value;
                sa.ItemState.Value = sa.Value ?? string.Empty;

                logs.Add(new ActionLog
                {
                    ExecutionId = executionId,
                    Timestamp = DateTime.UtcNow,
                    TriggerSource = JsonSerializer.Serialize(
                        BuildTriggerSource(triggerType, userContext, sa.ItemState, workflowContext)),
                    PastValue = pastValue,
                    CurrentValue = sa.Value ?? string.Empty,
                    ItemStateId = sa.ItemState.ItemStateId,
                    SmartWorkflowId = sa.SmartWorkflowId
                });
            }
            else if (sa.TargetSceneId != null)
            {
                // Load the target scene with full context for its SmartActions.
                // The parent workflow remains the trigger context for all nested logs.
                var scene = await _db.Scenes
                    .Include(s => s.SceneNavigation)
                        .ThenInclude(wf => wf.SmartActions)
                            .ThenInclude(sa2 => sa2.ItemState!) // nullable for TargetScene actions
                                .ThenInclude(is_ => is_.ActionDefinition)
                    .Include(s => s.SceneNavigation)
                        .ThenInclude(wf => wf.SmartActions)
                            .ThenInclude(sa2 => sa2.ItemState!) // nullable for TargetScene actions
                                .ThenInclude(is_ => is_.Item)
                                    .ThenInclude(i => i.ItemModel)
                                        .ThenInclude(im => im.ItemCategory)
                    .Include(s => s.SceneNavigation)
                        .ThenInclude(wf => wf.SmartActions)
                            .ThenInclude(sa2 => sa2.ItemState!) // nullable for TargetScene actions
                                .ThenInclude(is_ => is_.Item)
                                    .ThenInclude(i => i.Room)
                                        .ThenInclude(r => r.Unit)
                    .FirstOrDefaultAsync(s => s.SceneId == sa.TargetSceneId);

                if (scene != null)
                {
                    await ExecuteSmartActions(
                        scene.SceneNavigation.SmartActions,
                        executionId,
                        triggerType,       // keep original trigger type (e.g. "automation")
                        workflowContext,   // keep original workflow as attribution
                        userContext,
                        logs);
                }
            }
        }
    }

    // ─── TRIGGER SOURCE BUILDERS ─────────────────────────────────────────────

    private static object BuildTriggerSource(
        string triggerType,
        object userContext,
        ItemState itemState,
        object? workflowContext)
        => new
        {
            triggerType,
            user = userContext,
            item = new
            {
                itemId = itemState.Item.ItemId,
                name = itemState.Item.Name,
                itemModel = itemState.Item.ItemModel.Name,
                itemCategory = itemState.Item.ItemModel.ItemCategory.Name,
                room = itemState.Item.Room.Name,
                unit = itemState.Item.Room.Unit.Name
            },
            actionDefinition = new
            {
                actionDefinitionId = itemState.ActionDefinition.ActionDefinitionId,
                name = itemState.ActionDefinition.Name,
                valueType = itemState.ActionDefinition.ValueType,
                controllable = itemState.ActionDefinition.Controllable
            },
            workflow = workflowContext
        };

    private static object BuildUserContext(User user)
        => new { userId = user.UserId, name = user.Name, surname = user.Surname };

    private static object BuildWorkflowContext(SmartWorkflow wf)
        => new { smartWorkflowId = wf.SmartWorkflowId, name = wf.Name, type = wf.Type };

    // ─── MAPPING ─────────────────────────────────────────────────────────────

    private static ActionLogDto MapResponse(ActionLog log)
    {
        var valueType = ExtractValueType(log.TriggerSource);
        return new ActionLogDto
        {
            ActionLogId = log.ActionLogId,
            ExecutionId = log.ExecutionId,
            Timestamp = log.Timestamp,
            TriggerSource = JsonSerializer.Deserialize<JsonElement>(log.TriggerSource),
            PastValue = ValueTypeParser.TryParseValue(log.PastValue, valueType),
            CurrentValue = ValueTypeParser.TryParseValue(log.CurrentValue, valueType),
            ItemStateId = log.ItemStateId,
            SmartWorkflowId = log.SmartWorkflowId
        };
    }

    private static string ExtractValueType(string triggerSource)
    {
        try
        {
            var doc = JsonSerializer.Deserialize<JsonElement>(triggerSource);
            return doc.GetProperty("actionDefinition").GetProperty("valueType").GetString() ?? "string";
        }
        catch { return "string"; }
    }
}

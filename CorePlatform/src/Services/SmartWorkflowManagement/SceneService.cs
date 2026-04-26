// SceneService.cs
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class SceneService : ISceneService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public SceneService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }
    
    // ─── PUBLIC METHODS ──────────────────────────────────────────────────────

    public async Task<List<SceneDto>> GetScenes()
    {
        var query = QueryWithIncludes();
        if (_currentUser.Role != "admin")
            query = query.Where(a => a.SceneNavigation.UserId == _currentUser.UserId);
        var scenes = await query.ToListAsync();
        return scenes.Select(a => MapResponse(a)).ToList();
    }

    public async Task<List<SceneDto>> GetScenes(int itemId)
    {
        var query = QueryWithIncludes()
            .Where(a => a.SceneNavigation.SmartActions
                .Any(b => b.ItemState != null && b.ItemState.ItemId == itemId));
        if (_currentUser.Role != "admin")
            query = query.Where(a => a.SceneNavigation.UserId == _currentUser.UserId);
        var scenes = await query.ToListAsync();
        return scenes.Select(a => MapResponse(a)).ToList();
    }

    public async Task<SceneDto?> GetScene(int id)
    {
        var query = QueryWithIncludes().Where(a => a.SceneId == id);
        if (_currentUser.Role != "admin")
            query = query.Where(a => a.SceneNavigation.UserId == _currentUser.UserId);
        var scene = await query.FirstOrDefaultAsync();
        return scene == null ? null : MapResponse(scene);
    }

    public async Task<SceneDto> PostScene(SceneDto request)
    {
        var smartWorkflow = new SmartWorkflow
        {
            Name = request.Name,
            Type = "scene",
            UserId = _currentUser.UserId // Ensure ownership from token, not client input
        };
        _db.SmartWorkflows.Add(smartWorkflow);
        await _db.SaveChangesAsync();

        var scene = new Scene { SceneId = smartWorkflow.SmartWorkflowId };
        _db.Scenes.Add(scene);
        await _db.SaveChangesAsync();

        var smartActions = await BuildSmartActions(request.SmartActions, smartWorkflow.SmartWorkflowId);
        _db.SmartActions.AddRange(smartActions);
        await _db.SaveChangesAsync();

        return await GetScene(scene.SceneId) ?? MapResponse(scene);
    }

    public async Task<bool> PutScene(SceneDto request)
    {
        var scene = await _db.Scenes
            .Include(a => a.SceneNavigation)
                .ThenInclude(b => b.SmartActions)
            .FirstOrDefaultAsync(a => a.SceneId == request.SceneId);
        if (scene == null) return false;
        if (_currentUser.Role != "admin" && scene.SceneNavigation.UserId != _currentUser.UserId) return false;

        scene.SceneNavigation.Name = request.Name;
        _db.SmartActions.RemoveRange(scene.SceneNavigation.SmartActions);
        await _db.SaveChangesAsync();

        var smartActions = await BuildSmartActions(request.SmartActions, scene.SceneId);
        _db.SmartActions.AddRange(smartActions);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteScene(int id)
    {
        var scene = await _db.Scenes
            .Include(a => a.SceneNavigation)
                .ThenInclude(b => b.SmartActions)
            .FirstOrDefaultAsync(a => a.SceneId == id);
        if (scene == null) return false;
        if (_currentUser.Role != "admin" && scene.SceneNavigation.UserId != _currentUser.UserId) return false;
        _db.SmartActions.RemoveRange(scene.SceneNavigation.SmartActions);
        await _db.SaveChangesAsync();
        _db.SmartWorkflows.Remove(scene.SceneNavigation);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

    private IQueryable<Scene> QueryWithIncludes()
        => _db.Scenes
            .Include(a => a.SceneNavigation)
                .ThenInclude(b => b.SmartActions)
                    .ThenInclude(c => c.ItemState!)
                        .ThenInclude(d => d.ActionDefinition)
            .Include(a => a.SceneNavigation)
                .ThenInclude(b => b.SmartActions)
                    .ThenInclude(c => c.ItemState!)
                        .ThenInclude(d => d.Item)
                            .ThenInclude(e => e.ItemModel)
                                .ThenInclude(f => f.ItemCategory);

    private async Task<List<SmartAction>> BuildSmartActions(
        List<SceneDto.SmartActionDto> requestActions, int smartWorkflowId)
    {
        var smartActions = new List<SmartAction>();
        foreach (var sa in requestActions)
        {
            var itemState = await _db.ItemStates
                .Include(a => a.ActionDefinition)
                .FirstOrDefaultAsync(a => a.ItemStateId == sa.ItemStateId);

            if (itemState == null)
                throw new ArgumentException($"ItemState {sa.ItemStateId} not found.");

            var (isValid, error) = ValueTypeValidator.Validate(sa.Value!, itemState.ActionDefinition);
            if (!isValid)
                throw new ArgumentException(error);

            smartActions.Add(new SmartAction
            {
                SmartWorkflowId = smartWorkflowId,
                ItemStateId = sa.ItemStateId,
                Value = sa.Value?.ToString()
            });
        }
        return smartActions;
    }

    // ─── MAPPING HELPERS ────────────────────────────────────────────────────

    internal static SceneDto MapResponse(Scene scene)
    {
        return new SceneDto
        {
            SceneId = scene.SceneId,
            Name = scene.SceneNavigation?.Name ?? string.Empty,
            UserId = scene.SceneNavigation?.UserId ?? 0,
            SmartActions = scene.SceneNavigation?.SmartActions?.Select(sa => new SceneDto.SmartActionDto
            {
                SmartActionId = sa.SmartActionId,
                ItemStateId = sa.ItemStateId,
                ItemName = sa.ItemState?.Item?.Name,
                ItemCategoryName = sa.ItemState?.Item?.ItemModel?.ItemCategory?.Name,
                ActionDefinitionName = sa.ItemState?.ActionDefinition?.Name,
                ValueType = sa.ItemState?.ActionDefinition?.ValueType,
                Value = sa.Value != null && sa.ItemState?.ActionDefinition?.ValueType != null
                    ? ValueTypeParser.TryParseValue(sa.Value, sa.ItemState.ActionDefinition.ValueType)
                    : sa.Value
            }).ToList() ?? new List<SceneDto.SmartActionDto>()
        };
    }
}
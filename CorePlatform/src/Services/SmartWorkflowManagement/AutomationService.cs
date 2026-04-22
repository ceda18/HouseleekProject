using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class AutomationService : IAutomationService
{
    private readonly AppDbContext _db;

    public AutomationService(AppDbContext db)
    {
        _db = db;
    }

    // ─── PUBLIC METHODS ──────────────────────────────────────────────────────

    public async Task<List<AutomationDto>> GetAutomations()
    {
        var automations = await QueryWithIncludes().ToListAsync();
        return automations.Select(a => MapResponse(a)).ToList();
    }

    public async Task<List<AutomationDto>> GetAutomations(int itemId)
    {
        var automations = await QueryWithIncludes()
            .Where(a => a.AutomationNavigation.SmartActions
                .Any(b => b.ItemState != null && b.ItemState.ItemId == itemId))
            .ToListAsync();
        return automations.Select(a => MapResponse(a)).ToList();
    }

    public async Task<AutomationDto?> GetAutomation(int id)
    {
        var automation = await QueryWithIncludes()
            .FirstOrDefaultAsync(a => a.AutomationId == id);
        return automation == null ? null : MapResponse(automation);
    }

    public async Task<AutomationDto> PostAutomation(AutomationDto request)
    {
        var smartWorkflow = new SmartWorkflow
        {
            Name = request.Name,
            Type = "automation",
            UserId = request.UserId
        };
        _db.SmartWorkflows.Add(smartWorkflow);
        await _db.SaveChangesAsync();

        var automation = new Automation { AutomationId = smartWorkflow.SmartWorkflowId };
        _db.Automations.Add(automation);
        await _db.SaveChangesAsync();

        var smartActions = await BuildSmartActions(request.SmartActions, smartWorkflow.SmartWorkflowId);
        _db.SmartActions.AddRange(smartActions);

        var triggers = await BuildTriggers(request.Triggers, automation.AutomationId);
        _db.AutomationTriggers.AddRange(triggers);

        await _db.SaveChangesAsync();

        return await GetAutomation(automation.AutomationId) ?? MapResponse(automation);
    }

    public async Task<bool> PutAutomation(AutomationDto request)
    {
        var automation = await _db.Automations
            .Include(a => a.AutomationNavigation)
                .ThenInclude(b => b.SmartActions)
            .Include(a => a.AutomationTriggers)
            .FirstOrDefaultAsync(a => a.AutomationId == request.AutomationId);
        if (automation == null) return false;

        automation.AutomationNavigation.Name = request.Name;

        _db.SmartActions.RemoveRange(automation.AutomationNavigation.SmartActions);
        _db.AutomationTriggers.RemoveRange(automation.AutomationTriggers);
        await _db.SaveChangesAsync();

        var smartActions = await BuildSmartActions(request.SmartActions, automation.AutomationId);
        _db.SmartActions.AddRange(smartActions);

        var triggers = await BuildTriggers(request.Triggers, automation.AutomationId);
        _db.AutomationTriggers.AddRange(triggers);

        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAutomation(int id)
    {
        var automation = await _db.Automations
            .Include(a => a.AutomationNavigation)
                .ThenInclude(b => b.SmartActions)
            .Include(a => a.AutomationTriggers)
            .FirstOrDefaultAsync(a => a.AutomationId == id);
        if (automation == null) return false;

        _db.SmartActions.RemoveRange(automation.AutomationNavigation.SmartActions);
        _db.AutomationTriggers.RemoveRange(automation.AutomationTriggers);
        await _db.SaveChangesAsync();

        _db.SmartWorkflows.Remove(automation.AutomationNavigation);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

    private IQueryable<Automation> QueryWithIncludes()
        => _db.Automations
            .Include(a => a.AutomationNavigation)
                .ThenInclude(b => b.SmartActions)
                    .ThenInclude(c => c.ItemState!) // nullable for TargetScene actions
                        .ThenInclude(d => d.ActionDefinition)
            .Include(a => a.AutomationNavigation)
                .ThenInclude(b => b.SmartActions)
                    .ThenInclude(c => c.ItemState!) // nullable for TargetScene actions
                        .ThenInclude(d => d.Item)
                            .ThenInclude(e => e.ItemModel)
                                .ThenInclude(f => f.ItemCategory)
            .Include(a => a.AutomationNavigation)
                .ThenInclude(b => b.SmartActions)
                    .ThenInclude(c => c.TargetScene!) // nullable for ItemState actions
                        .ThenInclude(d => d.SceneNavigation)
            .Include(a => a.AutomationTriggers)
                .ThenInclude(b => b.ItemState!) // nullable for non-ItemState triggers
                    .ThenInclude(c => c.ActionDefinition)
            .Include(a => a.AutomationTriggers)
                .ThenInclude(b => b.ItemState!) // nullable for non-ItemState triggers
                    .ThenInclude(c => c.Item)
                        .ThenInclude(d => d.ItemModel)
                            .ThenInclude(e => e.ItemCategory);

    private async Task<List<SmartAction>> BuildSmartActions(
        List<AutomationDto.SmartActionDto> requestActions, int smartWorkflowId)
    {
        var smartActions = new List<SmartAction>();
        foreach (var sa in requestActions)
        {
            if (sa.ItemStateId != null)
            {
                var itemState = await _db.ItemStates
                    .Include(a => a.ActionDefinition)
                    .FirstOrDefaultAsync(a => a.ItemStateId == sa.ItemStateId);

                if (itemState == null)
                    throw new ArgumentException($"ItemState {sa.ItemStateId} not found.");

                var (isValid, error) = ValueTypeValidator.Validate(sa.Value!.ToString()!, itemState.ActionDefinition);
                if (!isValid)
                    throw new ArgumentException(error);

                smartActions.Add(new SmartAction
                {
                    SmartWorkflowId = smartWorkflowId,
                    ItemStateId = sa.ItemStateId,
                    Value = sa.Value?.ToString()
                });
            }
            else if (sa.TargetSceneId != null)
            {
                var scene = await _db.Scenes.FindAsync(sa.TargetSceneId);
                if (scene == null)
                    throw new ArgumentException($"Scene {sa.TargetSceneId} not found.");

                smartActions.Add(new SmartAction
                {
                    SmartWorkflowId = smartWorkflowId,
                    TargetSceneId = sa.TargetSceneId
                });
            }
            else
            {
                throw new ArgumentException("SmartAction must have either ItemStateId or TargetSceneId.");
            }
        }
        return smartActions;
    }

    private async Task<List<AutomationTrigger>> BuildTriggers(
        List<AutomationDto.AutomationTriggerDto> requestTriggers, int automationId)
    {
        var triggers = new List<AutomationTrigger>();
        foreach (var t in requestTriggers)
        {
            if (t.ItemStateId != null)
            {
                var itemState = await _db.ItemStates.FirstOrDefaultAsync(a => a.ItemStateId == t.ItemStateId);
                if (itemState == null)
                    throw new ArgumentException($"ItemState {t.ItemStateId} not found.");
            }

            triggers.Add(new AutomationTrigger
            {
                AutomationId = automationId,
                TriggerType = t.TriggerType,
                ValueType = t.ValueType,
                Value = t.Value?.ToString() ?? string.Empty,
                Operand = t.Operand,
                ItemStateId = t.ItemStateId
            });
        }
        return triggers;
    }

    // ─── MAPPING HELPERS ────────────────────────────────────────────────────

    internal static AutomationDto MapResponse(Automation automation)
    {
        return new AutomationDto
        {
            AutomationId = automation.AutomationId,
            Name = automation.AutomationNavigation?.Name ?? string.Empty,
            UserId = automation.AutomationNavigation?.UserId ?? 0,
            Triggers = automation.AutomationTriggers?.Select(t => new AutomationDto.AutomationTriggerDto
            {
                AutomationTriggerId = t.AutomationTriggerId,
                TriggerType = t.TriggerType,
                ValueType = t.ValueType,
                Value = ValueTypeParser.TryParseValue(t.Value, t.ValueType),
                Operand = t.Operand,
                ItemStateId = t.ItemStateId,
                ItemName = t.ItemState?.Item?.Name,
                ActionDefinitionName = t.ItemState?.ActionDefinition?.Name,
                ItemCategoryName = t.ItemState?.Item?.ItemModel?.ItemCategory?.Name
            }).ToList() ?? new List<AutomationDto.AutomationTriggerDto>(),
            SmartActions = automation.AutomationNavigation?.SmartActions?.Select(sa => new AutomationDto.SmartActionDto
            {
                SmartActionId = sa.SmartActionId,
                ItemStateId = sa.ItemStateId,
                ItemName = sa.ItemState?.Item?.Name,
                ActionDefinitionName = sa.ItemState?.ActionDefinition?.Name,
                ValueType = sa.ItemState?.ActionDefinition?.ValueType,
                ItemCategoryName = sa.ItemState?.Item?.ItemModel?.ItemCategory?.Name,
                Value = sa.Value != null && sa.ItemState?.ActionDefinition?.ValueType != null
                    ? ValueTypeParser.TryParseValue(sa.Value, sa.ItemState.ActionDefinition.ValueType)
                    : sa.Value,
                TargetSceneId = sa.TargetSceneId,
                TargetSceneName = sa.TargetScene?.SceneNavigation?.Name
            }).ToList() ?? new List<AutomationDto.SmartActionDto>()
        };
    }
}
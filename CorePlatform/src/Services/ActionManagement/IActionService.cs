using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IActionService
{
    Task<bool> PutItem(ItemDto request);
    Task<bool> Execute(int smartWorkflowId);
    Task<List<ActionLogDto>> GetActionLogs();
}

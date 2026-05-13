using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IActionService
{
    // SO22 // PUT ITEM
    Task<bool> PutItem(ItemDto request);
    // SO33 // EXECUTE
    Task<bool> Execute(int smartWorkflowId);
    // SO45 // GET ACTION LOGS
    Task<List<ActionLogDto>> GetActionLogs();
}

using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAutomationService
{
    Task<List<AutomationDto>> GetAutomations();
    Task<List<AutomationDto>> GetAutomations(int itemId);
    Task<AutomationDto?> GetAutomation(int id);
    Task<AutomationDto> PostAutomation(AutomationDto request);
    Task<bool> PutAutomation(AutomationDto request);
    Task<bool> DeleteAutomation(int id);
}
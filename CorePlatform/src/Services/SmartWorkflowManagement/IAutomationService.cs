using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAutomationService
{

    // SO34 // GET AUTOMATIONS
    Task<List<AutomationDto>> GetAutomations();
    // SO41 // GET AUTOMATIONS FILTER
    Task<List<AutomationDto>> GetAutomations(int itemId);
    // SO42 // GET AUTOMATION
    Task<AutomationDto?> GetAutomation(int id);
    // SO40 // POST AUTOMATION
    Task<AutomationDto> PostAutomation(AutomationDto request);
    // SO43 // PUT AUTOMATION
    Task<bool> PutAutomation(AutomationDto request);
    // SO44 // DELETE AUTOMATION
    Task<bool> DeleteAutomation(int id);
}
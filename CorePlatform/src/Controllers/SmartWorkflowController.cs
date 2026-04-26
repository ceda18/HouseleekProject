using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;
using CorePlatform.src.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Ensure all endpoints require authentication
public class SmartWorkflowController : ControllerBase
{
    private readonly ISceneService _sceneService;
    private readonly IAutomationService _automationService;

    public SmartWorkflowController(ISceneService sceneService, IAutomationService automationService)
    {
        _sceneService = sceneService;
        _automationService = automationService;
    }

    // Scene

    [HttpGet("scenes")]
    public async Task<ActionResult<List<SceneDto>>> GetScenes()
        => Ok(await _sceneService.GetScenes());

    [HttpGet("scenes/{id}")]
    public async Task<ActionResult<SceneDto>> GetScene(int id)
    {
        var scene = await _sceneService.GetScene(id);
        return scene == null ? NotFound() : Ok(scene);
    }

    [HttpGet("scenes/filter/{itemId}")]
    public async Task<ActionResult<List<SceneDto>>> GetScenes(int itemId)
        => Ok(await _sceneService.GetScenes(itemId));

    [HttpPost("scenes")]
    public async Task<ActionResult<SceneDto>> PostScene(SceneDto request)
    {
        var scene = await _sceneService.PostScene(request);
        return CreatedAtAction(nameof(GetScene), new { id = scene.SceneId }, scene);
    }

    [HttpPut("scenes")]
    public async Task<ActionResult> PutScene(SceneDto request)
    {
        var result = await _sceneService.PutScene(request);
        return result ? Ok() : NotFound();
    }

    [HttpDelete("scenes/{id}")]
    public async Task<ActionResult> DeleteScene(int id)
    {
        var result = await _sceneService.DeleteScene(id);
        return result ? Ok() : NotFound();
    }

    // Scene

    [HttpGet("automations")]
    public async Task<ActionResult<List<AutomationDto>>> GetAutomations()
        => Ok(await _automationService.GetAutomations());

    [HttpGet("automations/{id}")]
    public async Task<ActionResult<AutomationDto>> GetAutomation(int id)
    {
        var automation = await _automationService.GetAutomation(id);
        return automation == null ? NotFound() : Ok(automation);
    }

    [HttpGet("automations/filter/{itemId}")]
    public async Task<ActionResult<List<AutomationDto>>> GetAutomations(int itemId)
        => Ok(await _automationService.GetAutomations(itemId));

    [HttpPost("automations")]
    public async Task<ActionResult<AutomationDto>> PostAutomation(AutomationDto request)
    {
        var automation = await _automationService.PostAutomation(request);
        return CreatedAtAction(nameof(GetAutomation), new { id = automation.AutomationId }, automation);
    }

    [HttpPut("automations")]
    public async Task<ActionResult> PutAutomation(AutomationDto request)
    {
        var result = await _automationService.PutAutomation(request);
        return result ? Ok() : NotFound();
    }

    [HttpDelete("automations/{id}")]
    public async Task<ActionResult> DeleteAutomation(int id)
    {
        var result = await _automationService.DeleteAutomation(id);
        return result ? Ok() : NotFound();
    }


}
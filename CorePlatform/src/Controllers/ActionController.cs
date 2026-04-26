using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Ensure all endpoints require authentication
public class ActionController : ControllerBase
{
    private readonly IActionService _actionService;

    public ActionController(IActionService actionService)
    {
        _actionService = actionService;
    }

    /// <summary>SO22 — Update item name, room, and/or state values.</summary>
    [HttpPut("items")]
    public async Task<ActionResult> PutItem(ItemDto request)
    {
        var result = await _actionService.PutItem(request);
        return result ? Ok() : NotFound();
    }

    /// <summary>SO33 — Execute all SmartActions of a SmartWorkflow (Scene or Automation).</summary>
    [HttpPost("execute/{smartWorkflowId}")]
    public async Task<ActionResult> Execute(int smartWorkflowId)
    {
        var result = await _actionService.Execute(smartWorkflowId);
        return result ? Ok() : NotFound();
    }

    /// <summary>SO45 — Get all action logs ordered by most recent first.</summary>
    [HttpGet("logs")]
    public async Task<ActionResult<List<ActionLogDto>>> GetActionLogs()
        => Ok(await _actionService.GetActionLogs());
}

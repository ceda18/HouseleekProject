using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AIAgentController : ControllerBase
{
    private readonly IAIAgentService _aiAgentService;
    private readonly IConfiguration _config;

    public AIAgentController(IAIAgentService aiAgentService, IConfiguration config)
    {
        _aiAgentService = aiAgentService;
        _config = config;
    }

    /// <summary>
    /// SO46 — Opens the chat session.
    /// Builds and sends the user snapshot to the agent service.
    /// Returns existing history so the UI can restore an ongoing conversation.
    /// </summary>
    [HttpPost("chat/start")]
    public async Task<ActionResult<List<AgentMessageDto>>> StartChat()
    {
        var history = await _aiAgentService.StartChat();
        return Ok(history);
    }

    /// <summary>
    /// SO47 — Sends a user message and returns the agent's reply.
    /// </summary>
    [HttpPost("chat/message")]
    public async Task<ActionResult<AgentMessageDto>> SendMessage([FromBody] ChatMessageRequest request)
    {
        var response = await _aiAgentService.SendMessage(request.Message);
        return response == null ? StatusCode(503) : Ok(response);
    }

    /// <summary>Returns the full in-memory chat history for the current user.</summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<AgentMessageDto>>> GetHistory()
        => Ok(await _aiAgentService.GetHistory());

    /// <summary>
    /// SO48 — Applies an agent proposal (Scene / Automation / Item) to the system.
    /// </summary>
    [HttpPost("proposals/apply")]
    public async Task<IActionResult> ApplyProposal([FromBody] ApplyProposalRequest request)
    {
        var result = await _aiAgentService.ApplyProposal(request);
        return result ? Ok() : BadRequest("Could not apply proposal.");
    }

    /// <summary>Clears the in-memory chat history and resets the agent session.</summary>
    [HttpPost("session/clear")]
    public async Task<IActionResult> ClearSession()
    {
        var result = await _aiAgentService.ClearSession();
        return result ? Ok() : StatusCode(503);
    }

    /// <summary>
    /// Executes a read-only SQL query via AgentDbContext.
    /// Called exclusively by the AIAgent service — authenticated via API key, not JWT.
    /// </summary>
    [HttpPost("analytics/execute")]
    [AllowAnonymous]
    public async Task<IActionResult> ExecuteAnalytics(
        [FromBody] AnalyticsRequest request,
        [FromHeader(Name = "X-Agent-Api-Key")] string? apiKey)
    {
        if (apiKey != _config["AgentService:ApiKey"])
            return Unauthorized();

        try
        {
            var results = await _aiAgentService.ExecuteAnalyticsQuery(request.Sql);
            return Ok(results);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}

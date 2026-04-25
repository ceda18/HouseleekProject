using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// SO1 — Login with email and password, returns JWT token.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var response = await _authService.Login(request);
        return response == null ? Unauthorized() : Ok(response);
    }

    /// <summary>
    /// SO2 — Logout (client-side token invalidation).
    /// </summary>
    [HttpPost("logout")]
    public ActionResult Logout()
    {
        _authService.Logout();
        return Ok();
    }
}

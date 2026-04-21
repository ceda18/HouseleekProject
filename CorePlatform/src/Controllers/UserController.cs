using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // User

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
        => Ok(await _userService.GetUsers());

    [HttpGet("users/{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userService.GetUser(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> PostUser(UserDto request)
    {
        var user = await _userService.PostUser(request);
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }

    [HttpPut("users")]
    public async Task<ActionResult> PutUser(UserDto request)
    {
        var result = await _userService.PutUser(request);
        return result ? Ok() : NotFound();
    }
    
}
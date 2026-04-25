namespace CorePlatform.src.DTOs;


public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Role { get; set; } = null!;
}

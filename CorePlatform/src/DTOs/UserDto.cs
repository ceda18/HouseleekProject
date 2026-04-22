using CorePlatform.src.Models;

namespace CorePlatform.src.DTOs;
public class UserDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Surname { get; set; } = null!;

    // AbstractUser properties
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;

}
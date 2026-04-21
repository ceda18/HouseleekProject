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

    public UserDto Response(User user)
    {
        UserId = user.UserId;
        Name = user.Name;
        Surname = user.Surname;
        Email = Encryptor.HashString(user.UserNavigation.Email);
        Password = Encryptor.HashString(user.UserNavigation.Password);
        return this;
    }

    public User Request()
    {
        User user = new User();
        user.UserId = this.UserId;
        user.Name = this.Name;
        user.Surname = this.Surname;
        user.UserNavigation = new AbstractUser
        {
            UserId = this.UserId,
            Email = this.Email,
            Password = this.Password
        };
        return user;
    }
}
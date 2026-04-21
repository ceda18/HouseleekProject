using CorePlatform.src.Models;
using System;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;
public class AbstractUserDto
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!; // Do not include email in the response DTO for security reasons

    public string Password { get; set; } = null!; // Do not include password in the response DTO for security reasons

    //public virtual Admin? Admin { get; set; }

    //public virtual User? User { get; set; }

    //public virtual Vendor? Vendor { get; set; }
    

    public AbstractUserDto Response(AbstractUser abstractUser)
    {
        UserId = abstractUser.UserId;
        Email = Encryptor.HashString(abstractUser.Email);
        Password = Encryptor.HashString(abstractUser.Password);
        return this;
    }

    public AbstractUser Request()
    {
        AbstractUser abstractUser = new AbstractUser();

        abstractUser.UserId = this.UserId;
        abstractUser.Email = this.Email;
        abstractUser.Password = this.Password;

        return abstractUser;
    }

}
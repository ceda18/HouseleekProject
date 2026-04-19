using CorePlatform.src.Models;
using System;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;
public class AbstractUserResponse
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!; // Do not include email in the response DTO for security reasons

    public string Password { get; set; } = null!; // Do not include password in the response DTO for security reasons

    //public virtual Admin? Admin { get; set; }

    //public virtual User? User { get; set; }

    //public virtual Vendor? Vendor { get; set; }
    
    
    public AbstractUserResponse(AbstractUser abstractUser)
    {
        UserId = abstractUser.UserId;
        Email = Encryptor.HashString(abstractUser.Email);
        Password = Encryptor.HashString(abstractUser.Password);
        //Admin = abstractUser.Admin;
        //User = abstractUser.User;
        //Vendor = abstractUser.Vendor;
    }

}
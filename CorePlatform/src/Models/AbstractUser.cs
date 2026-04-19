using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class AbstractUser
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public virtual Admin? Admin { get; set; }

    public virtual User? User { get; set; }

    public virtual Vendor? Vendor { get; set; }
}

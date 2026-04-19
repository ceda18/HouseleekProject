using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Admin
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Surname { get; set; } = null!;

    public virtual AbstractUser User { get; set; } = null!;
}

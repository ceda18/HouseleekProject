using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Surname { get; set; } = null!;

    public virtual ICollection<SmartWorkflow> SmartWorkflows { get; set; } = new List<SmartWorkflow>();

    public virtual ICollection<Unit> Units { get; set; } = new List<Unit>();

    public virtual AbstractUser UserNavigation { get; set; } = null!;
}

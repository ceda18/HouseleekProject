using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class SmartWorkflow
{
    public int SmartWorkflowId { get; set; }

    public string Type { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int UserId { get; set; }

    public virtual ICollection<ActionLog> ActionLogs { get; set; } = new List<ActionLog>();

    public virtual Automation? Automation { get; set; }

    public virtual Scene? Scene { get; set; }

    public virtual ICollection<SmartAction> SmartActions { get; set; } = new List<SmartAction>();

    public virtual User User { get; set; } = null!;
}

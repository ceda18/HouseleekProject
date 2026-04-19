using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Automation
{
    public int AutomationId { get; set; }

    public virtual SmartWorkflow AutomationNavigation { get; set; } = null!;

    public virtual ICollection<AutomationTrigger> AutomationTriggers { get; set; } = new List<AutomationTrigger>();
}

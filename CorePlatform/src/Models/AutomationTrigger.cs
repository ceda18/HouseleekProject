using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class AutomationTrigger
{
    public int AutomationTriggerId { get; set; }

    public int AutomationId { get; set; }

    public string TriggerType { get; set; } = null!;

    public string ValueType { get; set; } = null!;

    public string Value { get; set; } = null!;

    public string? Operand { get; set; }

    public int? ItemStateId { get; set; }

    public virtual Automation Automation { get; set; } = null!;

    public virtual ItemState? ItemState { get; set; }
}

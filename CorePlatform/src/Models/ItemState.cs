using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ItemState
{
    public int ItemStateId { get; set; }

    public int ActionDefinitionId { get; set; }

    public int ItemId { get; set; }

    public string Value { get; set; } = null!;

    public virtual ActionDefinition ActionDefinition { get; set; } = null!;

    public virtual ICollection<ActionLog> ActionLogs { get; set; } = new List<ActionLog>();

    public virtual ICollection<AutomationTrigger> AutomationTriggers { get; set; } = new List<AutomationTrigger>();

    public virtual Item Item { get; set; } = null!;

    public virtual ICollection<SmartAction> SmartActions { get; set; } = new List<SmartAction>();
}

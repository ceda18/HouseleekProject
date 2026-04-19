using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ActionLog
{
    public int ActionLogId { get; set; }

    public Guid ExecutionId { get; set; }

    public DateTime Timestamp { get; set; }

    public string TriggerSource { get; set; } = null!;

    public string PastValue { get; set; } = null!;

    public string CurrentValue { get; set; } = null!;

    public int? ItemStateId { get; set; }

    public int? SmartWorkflowId { get; set; }

    public virtual ItemState? ItemState { get; set; }

    public virtual SmartWorkflow? SmartWorkflow { get; set; }
}

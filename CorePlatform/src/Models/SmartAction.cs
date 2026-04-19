using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class SmartAction
{
    public int SmartActionId { get; set; }

    public int SmartWorkflowId { get; set; }

    public string? Value { get; set; }

    public int? ItemStateId { get; set; }

    public int? TargetSceneId { get; set; }

    public virtual ItemState? ItemState { get; set; }

    public virtual SmartWorkflow SmartWorkflow { get; set; } = null!;

    public virtual Scene? TargetScene { get; set; }
}

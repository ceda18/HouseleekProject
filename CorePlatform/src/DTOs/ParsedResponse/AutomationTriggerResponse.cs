using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;
public class AutomationTriggerResponse
{
    public int AutomationTriggerId { get; set; }

    public int AutomationId { get; set; }

    public string TriggerType { get; set; } = null!;

    public string ValueType { get; set; } = null!;

    public object Value { get; set; } = null!; // Change from string to object to allow for different types of values (e.g. int, double, string)

    public string? Operand { get; set; }

    public int? ItemStateId { get; set; }

    //public virtual Automation Automation { get; set; } = null!;

    //public virtual ItemState? ItemState { get; set; }

    public AutomationTriggerResponse(AutomationTrigger automationTrigger)
    {
        AutomationTriggerId = automationTrigger.AutomationTriggerId;
        AutomationId = automationTrigger.AutomationId;
        TriggerType = automationTrigger.TriggerType;
        ValueType = automationTrigger.ValueType;
        Value = ValueTypeParser.ParseValue(automationTrigger.Value, ValueType);
        Operand = automationTrigger.Operand;
        ItemStateId = automationTrigger.ItemStateId;
    }

}
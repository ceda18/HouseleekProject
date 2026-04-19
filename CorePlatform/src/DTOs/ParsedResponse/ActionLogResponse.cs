using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;

public class ActionLogResponse
{
    public int ActionLogId { get; set; }

    public Guid ExecutionId { get; set; }

    public DateTime Timestamp { get; set; }

    public string TriggerSource { get; set; } = null!;

    public object PastValue { get; set; } = null!; // Change from string to object to allow for different types of past values (e.g. int, double, string)

    public object CurrentValue { get; set; } = null!; // Change from string to object to allow for different types of current values (e.g. int, double, string)

    public int? ItemStateId { get; set; }

    public int? SmartWorkflowId { get; set; }

    //public virtual ItemState? ItemState { get; set; }

    //public virtual SmartWorkflow? SmartWorkflow { get; set; }

    public ActionLogResponse(ActionLog actionLog)
    {
        ActionLogId = actionLog.ActionLogId;
        ExecutionId = actionLog.ExecutionId;
        Timestamp = actionLog.Timestamp;
        TriggerSource = actionLog.TriggerSource;

        var valueType = actionLog.ItemState?.ActionDefinition?.ValueType;
        PastValue = valueType != null ? ValueTypeParser.ParseValue(actionLog.PastValue, valueType) : actionLog.PastValue;
        CurrentValue = valueType != null ? ValueTypeParser.ParseValue(actionLog.CurrentValue, valueType) : actionLog.CurrentValue;

        ItemStateId = actionLog.ItemStateId;
        SmartWorkflowId = actionLog.SmartWorkflowId;
        //ItemState = actionLog.ItemState;
        //SmartWorkflow = actionLog.SmartWorkflow;
    }


}
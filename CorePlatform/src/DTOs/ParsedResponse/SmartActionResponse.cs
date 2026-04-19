using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;
public class SmartActionResponse
{
    public int SmartActionId { get; set; }

    public int SmartWorkflowId { get; set; }

    public object? Value { get; set; } // Change from string to object to allow for different types of values (e.g. int, double, string)

    public int? ItemStateId { get; set; }

    public int? TargetSceneId { get; set; }

    //public virtual ItemState? ItemState { get; set; }

    //public virtual SmartWorkflow SmartWorkflow { get; set; } = null!;

    //public virtual Scene? TargetScene { get; set; }

    public SmartActionResponse(SmartAction smartAction)
    {
        SmartActionId = smartAction.SmartActionId;
        SmartWorkflowId = smartAction.SmartWorkflowId;
        if (smartAction.Value != null)
        {
            var valueType = smartAction.ItemState?.ActionDefinition?.ValueType;
            Value = valueType != null ? ValueTypeParser.ParseValue(smartAction.Value, valueType) : smartAction.Value;
        }
        else
        {
            Value = null;
        }
        ItemStateId = smartAction.ItemStateId;
        TargetSceneId = smartAction.TargetSceneId;
        //ItemState = smartAction.ItemState;
        //SmartWorkflow = smartAction.SmartWorkflow;
        //TargetScene = smartAction.TargetScene;
    }

}
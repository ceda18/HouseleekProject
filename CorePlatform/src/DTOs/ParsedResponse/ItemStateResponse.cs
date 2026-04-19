using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;
public class ItemStateResponse
{
    public int ItemStateId { get; set; }

    public int ActionDefinitionId { get; set; }

    public int ItemId { get; set; }

    public object Value { get; set; } = null!; // Change from string to object to allow for different types of values (e.g. int, double, string)

    //public virtual ActionDefinition ActionDefinition { get; set; } = null!;

    //public virtual ICollection<ActionLog> ActionLogs { get; set; } = new List<ActionLog>();

    //public virtual ICollection<AutomationTrigger> AutomationTriggers { get; set; } = new List<AutomationTrigger>();

    //public virtual Item Item { get; set; } = null!;

    //public virtual ICollection<SmartAction> SmartActions { get; set; } = new List<SmartAction>();

    public ItemStateResponse(ItemState itemState)
    {
        ItemStateId = itemState.ItemStateId;
        ActionDefinitionId = itemState.ActionDefinitionId;
        ItemId = itemState.ItemId;
        Value = ValueTypeParser.ParseValue(itemState.Value, itemState.ActionDefinition.ValueType);
        //ActionDefinition = itemState.ActionDefinition;
        //ActionLogs = itemState.ActionLogs;
        //AutomationTriggers = itemState.AutomationTriggers;
        //Item = itemState.Item;
        //SmartActions = itemState.SmartActions;
    }   

}
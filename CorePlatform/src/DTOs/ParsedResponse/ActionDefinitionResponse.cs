using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;

public class ActionDefinitionResponse
{
    public int ActionDefinitionId { get; set; }

    public int ItemModelId { get; set; }

    public string Name { get; set; } = null!;

    public bool Controllable { get; set; }

    public string ValueType { get; set; } = null!;

    public object DefaultValue { get; set; } = null!; // Change from string to object to allow for different types of default values (e.g. int, double, string)

    public double? MinValue { get; set; }

    public double? MaxValue { get; set; }

    //public virtual ItemModel ItemModel { get; set; } = null!;

    //public virtual ICollection<ItemState> ItemStates { get; set; } = new List<ItemState>();

    public ActionDefinitionResponse(ActionDefinition actionDefinition)
    {
        ActionDefinitionId = actionDefinition.ActionDefinitionId;
        ItemModelId = actionDefinition.ItemModelId;
        Name = actionDefinition.Name;
        Controllable = actionDefinition.Controllable;
        ValueType = actionDefinition.ValueType;
        DefaultValue = ValueTypeParser.ParseValue(actionDefinition.DefaultValue, actionDefinition.ValueType);
        MinValue = actionDefinition.MinValue;
        MaxValue = actionDefinition.MaxValue;
        //ItemModel = actionDefinition.ItemModel;
        //ItemStates = actionDefinition.ItemStates;
    }

}
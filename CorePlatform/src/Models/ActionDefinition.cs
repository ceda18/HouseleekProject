using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ActionDefinition
{
    public int ActionDefinitionId { get; set; }

    public int ItemModelId { get; set; }

    public string Name { get; set; } = null!;

    public bool Controllable { get; set; }

    public string ValueType { get; set; } = null!;

    public string DefaultValue { get; set; } = null!;

    public double? MinValue { get; set; }

    public double? MaxValue { get; set; }

    public virtual ItemModel ItemModel { get; set; } = null!;

    public virtual ICollection<ItemState> ItemStates { get; set; } = new List<ItemState>();
}

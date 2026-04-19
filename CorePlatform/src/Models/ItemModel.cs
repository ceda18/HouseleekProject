using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ItemModel
{
    public int ItemModelId { get; set; }

    public string Name { get; set; } = null!;

    public bool Published { get; set; }

    public int VendorId { get; set; }

    public int ItemCategoryId { get; set; }

    public virtual ICollection<ActionDefinition> ActionDefinitions { get; set; } = new List<ActionDefinition>();

    public virtual ItemCategory ItemCategory { get; set; } = null!;

    public virtual ICollection<ItemProperty> ItemProperties { get; set; } = new List<ItemProperty>();

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual Vendor Vendor { get; set; } = null!;
}

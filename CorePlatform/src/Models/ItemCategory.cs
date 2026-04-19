using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ItemCategory
{
    public int ItemCategoryId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<ItemModel> ItemModels { get; set; } = new List<ItemModel>();
}

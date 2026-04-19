using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Item
{
    public int ItemId { get; set; }

    public string Name { get; set; } = null!;

    public int ItemModelId { get; set; }

    public int RoomId { get; set; }

    public virtual ItemModel ItemModel { get; set; } = null!;

    public virtual ICollection<ItemState> ItemStates { get; set; } = new List<ItemState>();

    public virtual Room Room { get; set; } = null!;
}

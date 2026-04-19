using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Room
{
    public int RoomId { get; set; }

    public string Name { get; set; } = null!;

    public int UnitId { get; set; }

    public int RoomTypeId { get; set; }

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual RoomType RoomType { get; set; } = null!;

    public virtual Unit Unit { get; set; } = null!;
}

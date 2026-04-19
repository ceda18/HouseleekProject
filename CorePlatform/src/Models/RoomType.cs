using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class RoomType
{
    public int RoomTypeId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}

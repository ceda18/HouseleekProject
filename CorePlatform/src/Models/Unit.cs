using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Unit
{
    public int UnitId { get; set; }

    public string Name { get; set; } = null!;

    public int UserId { get; set; }

    public int UnitTypeId { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();

    public virtual UnitType UnitType { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

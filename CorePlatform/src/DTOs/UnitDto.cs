using System;
using System.Collections.Generic;

namespace CorePlatform.src.DTOs;

public class UnitDto
{
    public int UnitId { get; set; }
    public string Name { get; set; } = null!;
    public int UserId { get; set; }
    public int UnitTypeId { get; set; }
    public string UnitTypeName { get; set; } = null!;
    public List<RoomDto> Rooms { get; set; } = new();
}

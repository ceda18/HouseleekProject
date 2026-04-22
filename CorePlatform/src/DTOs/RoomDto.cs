using CorePlatform.src.Models;

namespace CorePlatform.src.DTOs;
public class RoomDto
{
    public int RoomId { get; set; }
    public string Name { get; set; } = null!;
    public int UnitId { get; set; }
    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = null!;
    public List<ItemDto> Items { get; set; } = new();
    
}
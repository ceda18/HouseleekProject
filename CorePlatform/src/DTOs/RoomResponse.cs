using CorePlatform.src.Models;

namespace CorePlatform.src.DTOs;

public partial class RoomResponse
{
    public int RoomId { get; set; }

    public string Name { get; set; } = null!;

    public int UnitId { get; set; }

    public int RoomTypeId { get; set; }

    //public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    //public virtual RoomType RoomType { get; set; } = null!;

    //public virtual Unit Unit { get; set; } = null!;

    public RoomResponse(Room room)
    {
        RoomId = room.RoomId;
        Name = room.Name;
        UnitId = room.UnitId;
        RoomTypeId = room.RoomTypeId;
    }

}
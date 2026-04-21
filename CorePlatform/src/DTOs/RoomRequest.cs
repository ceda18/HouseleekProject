using CorePlatform.src.Models;

namespace CorePlatform.src.DTOs;

public partial class RoomRequest

{
    public int RoomId { get; set; }

    public string Name { get; set; } = null!;

    public int UnitId { get; set; }

    public int RoomTypeId { get; set; }

    //public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    //public virtual RoomType RoomType { get; set; } = null!;

    //public virtual Unit Unit { get; set; } = null!;

    public Room Convert()
    {
        Room room = new Room();

        room.RoomId = this.RoomId;
        room.Name = this.Name;
        room.UnitId = this.UnitId;
        room.RoomTypeId = this.RoomTypeId;

        return room;
    }

}
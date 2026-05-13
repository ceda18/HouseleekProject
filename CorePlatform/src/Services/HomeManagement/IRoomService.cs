using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IRoomService
{
    // SO14 // GET ROOMS
    Task<List<RoomDto>> GetRooms();
    // SO15 // GET ROOM
    Task<RoomDto?> GetRoom(int id);
    // SO13 // POST ROOM
    Task<RoomDto> PostRoom(RoomDto request);
    // SO16 // PUT ROOM
    Task<bool> PutRoom(RoomDto request);
    // SO17 // DELETE ROOM
    Task<bool> DeleteRoom(int id);
}
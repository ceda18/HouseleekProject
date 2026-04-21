using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IRoomService
{
    Task<List<RoomDto>> GetRooms();
    Task<RoomDto?> GetRoom(int id);
    Task<RoomDto> PostRoom(RoomDto request);
    Task<bool> PutRoom(RoomDto request);
    Task<bool> DeleteRoom(int id);
}
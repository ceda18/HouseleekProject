// RoomService.cs
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class RoomService : IRoomService
{
    private readonly AppDbContext _db;

    public RoomService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RoomDto>> GetRooms()
    {
        var rooms = await _db.Rooms.ToListAsync();
        return rooms.Select(r => new RoomDto().Response(r)).ToList();
    }

    public async Task<RoomDto?> GetRoom(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        return room == null ? null : new RoomDto().Response(room);
    }

    public async Task<RoomDto> PostRoom(RoomDto request)
    {
        Room room = request.Request();
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();
        return new RoomDto().Response(room);
    }

    public async Task<bool> PutRoom(RoomDto request)
    {
        Room room = request.Request();
        _db.Rooms.Update(room);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteRoom(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return false;
        _db.Rooms.Remove(room);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }
}
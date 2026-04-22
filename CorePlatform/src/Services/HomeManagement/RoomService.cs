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
        var rooms = await _db.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.Items)
                .ThenInclude(i => i.ItemStates)
                    .ThenInclude(is_ => is_.ActionDefinition)
            .Include(r => r.Items)
                .ThenInclude(i => i.ItemModel)
                    .ThenInclude(im => im.ItemCategory)
            .ToListAsync();
        return rooms.Select(r => MapResponse(r)).ToList();
    }

    public async Task<RoomDto?> GetRoom(int id)
    {
        var room = await _db.Rooms
            .Include(r => r.RoomType)
            .Include(r => r.Items)
                .ThenInclude(i => i.ItemStates)
                    .ThenInclude(is_ => is_.ActionDefinition)
            .Include(r => r.Items)
                .ThenInclude(i => i.ItemModel)
                    .ThenInclude(im => im.ItemCategory)
            .FirstOrDefaultAsync(r => r.RoomId == id);
        return room == null ? null : MapResponse(room);
    }

    public async Task<RoomDto> PostRoom(RoomDto request)
    {
        Room room = MapRequest(request);
        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();
        return await GetRoom(room.RoomId) ?? MapResponse(room);
    }

    public async Task<bool> PutRoom(RoomDto request)
    {
        Room room = MapRequest(request);
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

    ///////////////////////////
    // MAPPING METHODS
    ///////////////////////////

    internal static RoomDto MapResponse(Room room)
    {
        return new RoomDto
        {
            RoomId = room.RoomId,
            Name = room.Name,
            UnitId = room.UnitId,
            RoomTypeId = room.RoomTypeId,
            RoomTypeName = room.RoomType?.Name ?? string.Empty,
            Items = room.Items.Select(i => ItemService.MapResponse(i)).ToList()
        };
    }

    private Room MapRequest(RoomDto request)
    {
        return new Room
        {
            RoomId = request.RoomId,
            Name = request.Name,
            UnitId = request.UnitId,
            RoomTypeId = request.RoomTypeId
        };
    }
}
// UnitService.cs
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class UnitService : IUnitService
{
    private readonly AppDbContext _db;

    public UnitService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<UnitDto>> GetUnits()
    {
        var units = await _db.Units
            .Include(u => u.UnitType)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.RoomType)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemStates)
                        .ThenInclude(is_ => is_.ActionDefinition)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemModel)
                        .ThenInclude(im => im.ItemCategory)
            .ToListAsync();
        return units.Select(u => MapResponse(u)).ToList();
    }

    public async Task<UnitDto?> GetUnit(int id)
    {
        var unit = await _db.Units
            .Include(u => u.UnitType)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.RoomType)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemStates)
                        .ThenInclude(is_ => is_.ActionDefinition)
            .Include(u => u.Rooms)
                .ThenInclude(r => r.Items)
                    .ThenInclude(i => i.ItemModel)
                        .ThenInclude(im => im.ItemCategory)
            .FirstOrDefaultAsync(u => u.UnitId == id);
        return unit == null ? null : MapResponse(unit);
    }

    public async Task<UnitDto> PostUnit(UnitDto request)
    {
        Unit unit = MapRequest(request);
        _db.Units.Add(unit);
        await _db.SaveChangesAsync();
        return await GetUnit(unit.UnitId) ?? MapResponse(unit);
    }

    public async Task<bool> PutUnit(UnitDto request)
    {
        Unit unit = MapRequest(request);
        _db.Units.Update(unit);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteUnit(int id)
    {
        var unit = await _db.Units.FindAsync(id);
        if (unit == null) return false;
        _db.Units.Remove(unit);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    ///////////////////////////
    // MAPPING METHODS
    ///////////////////////////

    public UnitDto MapResponse(Unit unit)
    {
        return new UnitDto
        {
            UnitId = unit.UnitId,
            Name = unit.Name,
            UserId = unit.UserId,
            UnitTypeId = unit.UnitTypeId,
            UnitTypeName = unit.UnitType?.Name ?? string.Empty,
            Rooms = unit.Rooms.Select(r => RoomService.MapResponse(r)).ToList()
        };
    }

    private Unit MapRequest(UnitDto request)
    {
        return new Unit
        {
            UnitId = request.UnitId,
            Name = request.Name,
            UserId = request.UserId,
            UnitTypeId = request.UnitTypeId
        };
    }
}
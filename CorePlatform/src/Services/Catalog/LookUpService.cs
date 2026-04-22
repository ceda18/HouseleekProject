using CorePlatform.src.Data;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class LookupService : ILookupService
{
    private readonly AppDbContext _db;

    public LookupService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<object>> GetItemCategories()
    {
        var categories = await _db.ItemCategories.ToListAsync();
        return categories.Select(ic => (object)ic).ToList();
    }

    public async Task<object?> GetItemCategory(int id)
    {
        var category = await _db.ItemCategories.FindAsync(id);
        return category == null ? null : (object)category;
    }

    public async Task<List<object>> GetRoomTypes()
    {
        var roomTypes = await _db.RoomTypes.ToListAsync();
        return roomTypes.Select(rt => (object)rt).ToList();
    }

    public async Task<object?> GetRoomType(int id)
    {
        var roomType = await _db.RoomTypes.FindAsync(id);
        return roomType == null ? null : (object)roomType;
    }

    public async Task<List<object>> GetUnitTypes()
    {
        var unitTypes = await _db.UnitTypes.ToListAsync();
        return unitTypes.Select(ut => (object)ut).ToList();
    }

    public async Task<object?> GetUnitType(int id)
    {
        var unitType = await _db.UnitTypes.FindAsync(id);
        return unitType == null ? null : (object)unitType;
    }
}
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class ItemService : IItemService
{
    private readonly AppDbContext _db;

    public ItemService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ItemDto>> GetItems()
    {
        var items = await _db.Items
            .Include(i => i.ItemStates)
                .ThenInclude(is_ => is_.ActionDefinition)
            .ToListAsync();
        return items.Select(i => new ItemDto().Response(i)).ToList();
    }

    public async Task<ItemDto?> GetItem(int id)
    {
        var item = await _db.Items
            .Include(i => i.ItemStates)
                .ThenInclude(is_ => is_.ActionDefinition)
            .FirstOrDefaultAsync(i => i.ItemId == id);
        return item == null ? null : new ItemDto().Response(item);
    }

    public async Task<ItemDto> PostItem(ItemDto request)
    {
        var item = request.Request();
        _db.Items.Add(item);
        await _db.SaveChangesAsync();

        var actionDefinitions = await _db.ActionDefinitions
            .Where(ad => ad.ItemModelId == item.ItemModelId)
            .ToListAsync();

        var itemStates = actionDefinitions.Select(ad => new ItemState
        {
            ItemId = item.ItemId,
            ActionDefinitionId = ad.ActionDefinitionId,
            Value = ad.DefaultValue
        }).ToList();

        _db.ItemStates.AddRange(itemStates);
        await _db.SaveChangesAsync();

        return await GetItem(item.ItemId) ?? new ItemDto().Response(item);
    }

    public async Task<bool> DeleteItem(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return false;
        _db.Items.Remove(item);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }
}
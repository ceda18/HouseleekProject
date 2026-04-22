// ItemService.cs
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
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
            .Include(i => i.ItemModel)
                .ThenInclude(im => im.ItemCategory)
            .Include(i => i.ItemStates)
                .ThenInclude(is_ => is_.ActionDefinition)
            .ToListAsync();
        return items.Select(i => MapResponse(i)).ToList();
    }

    public async Task<ItemDto?> GetItem(int id)
    {
        var item = await _db.Items
            .Include(i => i.ItemModel)
                .ThenInclude(im => im.ItemCategory)
            .Include(i => i.ItemStates)
                .ThenInclude(is_ => is_.ActionDefinition)
            .FirstOrDefaultAsync(i => i.ItemId == id);
        return item == null ? null : MapResponse(item);
    }

    public async Task<ItemDto> PostItem(ItemDto request)
    {
        var item = MapRequest(request);
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

        return await GetItem(item.ItemId) ?? MapResponse(item);
    }

    public async Task<bool> DeleteItem(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return false;
        _db.Items.Remove(item);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    ///////////////////////////
    // MAPPING METHODS
    ///////////////////////////

    internal static ItemDto MapResponse(Item item)
    {
        return new ItemDto
        {
            ItemId = item.ItemId,
            Name = item.Name,
            RoomId = item.RoomId,
            ItemModelId = item.ItemModelId,
            ItemModelName = item.ItemModel.Name,
            ItemCategoryName = item.ItemModel.ItemCategory.Name,
            ItemStates = item.ItemStates.Select(is_ => new ItemDto.ItemStateDto
            {
                ItemStateId = is_.ItemStateId,
                ActionDefinitionId = is_.ActionDefinitionId,
                ActionDefinitionName = is_.ActionDefinition.Name,
                Controllable = is_.ActionDefinition.Controllable,
                ValueType = is_.ActionDefinition.ValueType,
                Value = ValueTypeParser.TryParseValue(is_.Value, is_.ActionDefinition.ValueType),

            }).ToList()
        };
    }

    private Item MapRequest(ItemDto request)
    {
        return new Item
        {
            ItemId = request.ItemId,
            Name = request.Name,
            ItemModelId = request.ItemModelId,
            RoomId = request.RoomId
        };
    }
}
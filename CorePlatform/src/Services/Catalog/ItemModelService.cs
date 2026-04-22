// ItemModelService.cs
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using CorePlatform.src.Utility;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class ItemModelService : IItemModelService
{
    private readonly AppDbContext _db;

    public ItemModelService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ItemModelDto>> GetItemModels()
    {
        var models = await _db.ItemModels
            .Include(im => im.ItemCategory)
            .Include(im => im.Vendor)
            .Include(im => im.ItemProperties)
            .Include(im => im.ActionDefinitions)
            .Where(im => im.Published)
            .ToListAsync();
        return models.Select(im => MapResponse(im)).ToList(); // Only return published models
    }

    public async Task<ItemModelDto?> GetItemModel(int id)
    {
        var model = await _db.ItemModels
            .Include(im => im.ItemCategory)
            .Include(im => im.Vendor)
            .Include(im => im.ItemProperties)
            .Include(im => im.ActionDefinitions)
            .FirstOrDefaultAsync(im => im.ItemModelId == id && im.Published); // Only return if published
        return model == null ? null : MapResponse(model);
    }

    public async Task<List<ItemModelDto>> GetItemModels(int? itemCategoryId, int? vendorId)
    {
        var query = _db.ItemModels
            .Include(im => im.ItemCategory)
            .Include(im => im.Vendor)
            .Include(im => im.ItemProperties)
            .Include(im => im.ActionDefinitions)
            .Where(im => im.Published);

        if (itemCategoryId.HasValue)
            query = query.Where(im => im.ItemCategoryId == itemCategoryId.Value); // Filter by category if provided

        if (vendorId.HasValue)
            query = query.Where(im => im.VendorId == vendorId.Value); // Filter by vendor if provided

        var models = await query.ToListAsync();
        return models.Select(im => MapResponse(im)).ToList();
    }

    internal static ItemModelDto MapResponse(ItemModel im)
    {
        return new ItemModelDto
        {
            ItemModelId = im.ItemModelId,
            Name = im.Name,
            VendorId = im.VendorId,
            VendorName = im.Vendor?.Name ?? string.Empty,
            ItemCategoryId = im.ItemCategoryId,
            ItemCategoryName = im.ItemCategory?.Name ?? string.Empty,
            ItemProperties = im.ItemProperties.Select(p => new ItemModelDto.ItemPropertyDto
            {
                ItemPropertyId = p.ItemPropertyId,
                Name = p.Name,
                Value = p.Value
            }).ToList(),
            ActionDefinitions = im.ActionDefinitions.Select(ad => new ItemModelDto.ActionDefinitionDto
            {
                ActionDefinitionId = ad.ActionDefinitionId,
                Name = ad.Name,
                Controllable = ad.Controllable,
                ValueType = ad.ValueType,
            }).ToList()
        };
    }
}
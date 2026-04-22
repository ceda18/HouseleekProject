using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CatalogController : ControllerBase
{

    private readonly ILookupService _lookupService;
    private readonly IVendorService _vendorService;
    private readonly IItemModelService _itemModelService;


    public CatalogController(ILookupService lookupService, IVendorService vendorService, IItemModelService itemModelService)
    {
        _lookupService = lookupService;
        _vendorService = vendorService;
        _itemModelService = itemModelService;
    }

    // Lookups

    [HttpGet("item-categories")]
    public async Task<ActionResult<List<object>>> GetItems()
        => Ok(await _lookupService.GetItemCategories());

    [HttpGet("items/{id}")]
    public async Task<ActionResult<object>> GetItem(int id)
    {
        var item = await _lookupService.GetItemCategory(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpGet("room-types")]
    public async Task<ActionResult<List<object>>> GetRoomTypes()
        => Ok(await _lookupService.GetRoomTypes());

    [HttpGet("room-types/{id}")]
    public async Task<ActionResult<object>> GetRoomType(int id)
    {
        var item = await _lookupService.GetRoomType(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpGet("unit-types")]
    public async Task<ActionResult<List<object>>> GetUnitTypes()
        => Ok(await _lookupService.GetUnitTypes());

    [HttpGet("unit-types/{id}")]
    public async Task<ActionResult<object>> GetUnitType(int id)
    {
        var item = await _lookupService.GetUnitType(id);
        return item == null ? NotFound() : Ok(item);
    }

    // Vendor

    [HttpGet("vendors")]
    public async Task<ActionResult<List<VendorDto>>> GetVendors()
        => Ok(await _vendorService.GetVendors());

    [HttpGet("vendors/{id}")]
    public async Task<ActionResult<VendorDto>> GetVendor(int id)
    {
        var item = await _vendorService.GetVendor(id);
        return item == null ? NotFound() : Ok(item);
    }

    // Item Models

    [HttpGet("item-models")]
    public async Task<ActionResult<List<ItemModelDto>>> GetItemModels()
        => Ok(await _itemModelService.GetItemModels());

    [HttpGet("item-models/{id}")]
    public async Task<ActionResult<ItemModelDto>> GetItemModel(int id)
    {
        var item = await _itemModelService.GetItemModel(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpGet("item-models/filter")]
    public async Task<ActionResult<List<ItemModelDto>>> GetItemModels(
    [FromQuery] int? itemCategoryId,
    [FromQuery] int? vendorId)
    => Ok(await _itemModelService.GetItemModels(itemCategoryId, vendorId));

}
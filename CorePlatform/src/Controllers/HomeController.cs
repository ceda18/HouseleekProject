using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Ensure all endpoints require authentication
public class HomeController : ControllerBase
{

    private readonly IItemService _itemService;
    private readonly IRoomService _roomService;
    private readonly IUnitService _unitService;

    public HomeController(IItemService itemService, IRoomService roomService, IUnitService unitService)
    {

        _itemService = itemService;
        _roomService = roomService;
        _unitService = unitService;
    }

    // Item

    [HttpGet("items")]
    public async Task<ActionResult<List<ItemDto>>> GetItems()
        => Ok(await _itemService.GetItems());

    [HttpGet("items/{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _itemService.GetItem(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost("items")]
    public async Task<ActionResult<ItemDto>> PostItem(ItemDto request)
    {
        var item = await _itemService.PostItem(request);
        return CreatedAtAction(nameof(GetItem), new { id = item.ItemId }, item);
    }

    [HttpDelete("items/{id}")]
    public async Task<ActionResult> DeleteItem(int id)
    {
        var result = await _itemService.DeleteItem(id);
        return result ? Ok() : NotFound();
    }

    // Room

    [HttpGet("rooms")]
    public async Task<ActionResult<List<RoomDto>>> GetRooms()
        => Ok(await _roomService.GetRooms());

    [HttpGet("rooms/{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _roomService.GetRoom(id);
        return room == null ? NotFound() : Ok(room);
    }

    [HttpPost("rooms")]
    public async Task<ActionResult<RoomDto>> PostRoom(RoomDto request)
    {
        var room = await _roomService.PostRoom(request);
        return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, room);
    }

    [HttpPut("rooms")]
    public async Task<ActionResult> PutRoom(RoomDto request)
    {
        var result = await _roomService.PutRoom(request);
        return result ? Ok() : NotFound();
    }

    [HttpDelete("rooms/{id}")]
    public async Task<ActionResult> DeleteRoom(int id)
    {
        var result = await _roomService.DeleteRoom(id);
        return result ? Ok() : NotFound();
    }

    // Unit

    [HttpGet("units")]
    public async Task<ActionResult<List<UnitDto>>> GetUnits()
        => Ok(await _unitService.GetUnits());

    [HttpGet("units/{id}")]
    public async Task<ActionResult<UnitDto>> GetUnit(int id)
    {
        var unit = await _unitService.GetUnit(id);
        return unit == null ? NotFound() : Ok(unit);
    }

    [HttpPost("units")]
    public async Task<ActionResult<UnitDto>> PostUnit(UnitDto request)
    {
        var unit = await _unitService.PostUnit(request);
        return CreatedAtAction(nameof(GetUnit), new { id = unit.UnitId }, unit);
    }

    [HttpPut("units")]
    public async Task<ActionResult> PutUnit(UnitDto request)
    {
        var result = await _unitService.PutUnit(request);
        return result ? Ok() : NotFound();
    }

    [HttpDelete("units/{id}")]
    public async Task<ActionResult> DeleteUnit(int id)
    {
        var result = await _unitService.DeleteUnit(id);
        return result ? Ok() : NotFound();
    }

}
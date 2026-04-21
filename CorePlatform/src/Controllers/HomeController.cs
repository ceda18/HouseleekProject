using CorePlatform.src.DTOs;
using CorePlatform.src.Services;
using Microsoft.AspNetCore.Mvc;

namespace CorePlatform.src.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HomeController : ControllerBase
{
    private readonly IRoomService _roomService;
    private readonly IItemService _itemService;

    public HomeController(IRoomService roomService, IItemService itemService)
    {
        _roomService = roomService;
        _itemService = itemService;
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

}
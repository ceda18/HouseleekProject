using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IItemService
{
    // SO20 // GET ITEMS
    Task<List<ItemDto>> GetItems();
    // SO21 // GET ITEM
    Task<ItemDto?> GetItem(int id);
    // SO19 // POST ITEM
    Task<ItemDto> PostItem(ItemDto request);
    // SO23 // DELETE ITEM
    Task<bool> DeleteItem(int id);
}
using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IItemService
{
    Task<List<ItemDto>> GetItems();
    Task<ItemDto?> GetItem(int id);
    Task<ItemDto> PostItem(ItemDto request);
    Task<bool> DeleteItem(int id);
}
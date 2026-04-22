
using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IItemModelService
{
    Task<List<ItemModelDto>> GetItemModels();
    Task<ItemModelDto?> GetItemModel(int id);
    Task<List<ItemModelDto>> GetItemModels(int? itemCategoryId, int? vendorId);
}
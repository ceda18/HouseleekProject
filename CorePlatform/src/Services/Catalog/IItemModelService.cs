
using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IItemModelService
{

    // SO18 // GET ITEM MODELS
    Task<List<ItemModelDto>> GetItemModels();
    // SO28 // GET ITEM MODEL
    Task<ItemModelDto?> GetItemModel(int id);
    // SO25 // GET ITEM MODELS FILTER
    Task<List<ItemModelDto>> GetItemModels(int? itemCategoryId, int? vendorId);
}
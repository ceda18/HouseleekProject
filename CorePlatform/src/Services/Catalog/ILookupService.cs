
namespace CorePlatform.src.Services;

public interface ILookupService
{
    Task<List<object>> GetItemCategories();
    Task<object?> GetItemCategory(int id);
    Task<List<object>> GetRoomTypes();
    Task<object?> GetRoomType(int id);
    Task<List<object>> GetUnitTypes();
    Task<object?> GetUnitType(int id);
}
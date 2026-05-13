
namespace CorePlatform.src.Services;

public interface ILookupService
{

    // SO26 // GET ITEM CATEGORIES
    Task<List<object>> GetItemCategories();
    // SO29 // GET ITEM CATEGORY
    Task<object?> GetItemCategory(int id);
    // SO12 // GET ROOM TYPES
    Task<List<object>> GetRoomTypes();
    // SO31 // GET ROOM TYPE
    Task<object?> GetRoomType(int id);
    // SO6 // GET UNIT TYPES
    Task<List<object>> GetUnitTypes();
    // SO30 // GET UNIT TYPE
    Task<object?> GetUnitType(int id);
}
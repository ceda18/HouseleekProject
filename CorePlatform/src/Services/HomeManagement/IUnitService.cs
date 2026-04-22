using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IUnitService
{
    Task<List<UnitDto>> GetUnits();
    Task<UnitDto?> GetUnit(int id);
    Task<UnitDto> PostUnit(UnitDto request);
    Task<bool> PutUnit(UnitDto request);
    Task<bool> DeleteUnit(int id);
}
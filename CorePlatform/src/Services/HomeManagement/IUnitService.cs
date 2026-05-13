using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IUnitService
{
    // SO8 // GET UNITS
    Task<List<UnitDto>> GetUnits();
    // SO9 // GET UNIT
    Task<UnitDto?> GetUnit(int id);
    // SO7 // POST UNIT
    Task<UnitDto> PostUnit(UnitDto request);
    // SO10 // PUT UNIT
    Task<bool> PutUnit(UnitDto request);
    // SO11 // DELETE UNIT
    Task<bool> DeleteUnit(int id);
}
using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsers();
    // SO4 // GET USER
    Task<UserDto?> GetUser(int id);
    // SO3 // POST USER
    Task<UserDto> PostUser(UserDto request);
    // SO5 // PUT USER
    Task<bool> PutUser(UserDto request);
    
}
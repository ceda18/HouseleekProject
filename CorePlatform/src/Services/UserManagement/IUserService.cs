using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsers();
    Task<UserDto?> GetUser(int id);
    Task<UserDto> PostUser(UserDto request);
    Task<bool> PutUser(UserDto request);
}
using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAuthService
{
    Task<LoginResponse?> Login(LoginRequest request);
    bool Logout();
}

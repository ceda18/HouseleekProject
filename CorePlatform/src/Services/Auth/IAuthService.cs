using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAuthService
{
    // SO1 // LOGIN
    Task<LoginResponse?> Login(LoginRequest request);
    // SO2 // LOGOUT
    bool Logout();
}

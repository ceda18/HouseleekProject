using System.Security.Claims;

namespace CorePlatform.src.Services;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _http;

    public CurrentUser(IHttpContextAccessor http)
    {
        _http = http;
    }

    public int UserId => int.TryParse(
        _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

    public string Role =>
        _http.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
}

namespace CorePlatform.src.Services;

public interface ICurrentUser
{
    int UserId { get; }
    string Role { get; }
}

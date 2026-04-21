using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<UserDto>> GetUsers()
    {
        var users = await _db.Users
            .Include(u => u.UserNavigation)
            .ToListAsync();
        return users.Select(u => new UserDto().Response(u)).ToList();
    }

    public async Task<UserDto?> GetUser(int id)
    {
        var user = await _db.Users
            .Include(u => u.UserNavigation)
            .FirstOrDefaultAsync(u => u.UserId == id);
        return user == null ? null : new UserDto().Response(user);
    }

    public async Task<UserDto> PostUser(UserDto request)
    {
        var user = request.Request();
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new UserDto().Response(user);
    }

    public async Task<bool> PutUser(UserDto request)
    {
        var user = request.Request();
        _db.Users.Update(user);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

}
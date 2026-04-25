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
        return users.Select(u => MapResponse(u)).ToList();
    }

    public async Task<UserDto?> GetUser(int id)
    {
        var user = await _db.Users
            .Include(u => u.UserNavigation)
            .FirstOrDefaultAsync(u => u.UserId == id);
        return user == null ? null : MapResponse(user);
    }

    public async Task<UserDto> PostUser(UserDto request)
    {
        var user = MapRequest(request);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return MapResponse(user);
    }

    public async Task<bool> PutUser(UserDto request)
    {
        var user = MapRequest(request);
        _db.Users.Update(user);
        var affected = await _db.SaveChangesAsync();
        return affected > 0;
    }

    ////////////////////////////
    // MAPPING METHODS
    ///////////////////////////

    public UserDto MapResponse(User user)
    {
        UserDto response = new UserDto();
        response.UserId = user.UserId;
        response.Name = user.Name;
        response.Surname = user.Surname;
        response.Email = user.UserNavigation.Email;
        //response.Password = Encryptor.HashString(user.UserNavigation.Password);
        return response;
    }

    public User MapRequest(UserDto request)
    {
        User user = new User();
        user.UserId = request.UserId;
        user.Name = request.Name;
        user.Surname = request.Surname;
        user.UserNavigation = new AbstractUser
        {
            UserId = request.UserId,
            Email = request.Email,
            Password = Encryptor.HashString(request.Password!)
        };
        return user;
    }

}
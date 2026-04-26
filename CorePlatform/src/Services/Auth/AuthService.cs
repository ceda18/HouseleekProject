using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CorePlatform.src.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // ─── PUBLIC METHODS ──────────────────────────────────────────────────────

    /// <summary>
    /// SO1 — Verifies credentials and returns a JWT token with userId, email, and role.
    /// Password is compared as SHA-256 hash against the stored hash.
    /// Role is resolved from the AbstractUser subtype (user / admin / vendor).
    /// </summary>
    public async Task<LoginResponse?> Login(LoginRequest request)
    {
        var passwordHash = Encryptor.HashString(request.Password);

        var abstractUser = await _db.AbstractUsers
            .Include(u => u.User)
            .Include(u => u.Admin)
            .Include(u => u.Vendor)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == passwordHash);

        if (abstractUser == null) return null;

        var (role, name) = ResolveRoleAndName(abstractUser);
        var token = GenerateToken(abstractUser, role);

        return new LoginResponse
        {
            Token = token,
            UserId = abstractUser.UserId,
            Name = name,
            Role = role
        };
    }

    /// <summary>
    /// SO2 — Logout is client-side: the client discards the JWT token.
    /// Always returns true.
    /// </summary>
    public bool Logout() => true;

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

    /// Generates a JWT token containing userId, email, and role claims.
    private string GenerateToken(AbstractUser user, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(
                double.Parse(_config["Jwt:ExpiresInHours"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// Resolves the user's role and display name based on which subtype of AbstractUser is populated.
    private static (string role, string name) ResolveRoleAndName(AbstractUser user)
    {
        if (user.Admin != null)
            return ("admin", $"{user.Admin.Name} {user.Admin.Surname}");

        if (user.Vendor != null)
            return ("vendor", user.Vendor.Name);

        if (user.User != null)
            return ("user", $"{user.User.Name} {user.User.Surname}");

        return ("unknown", string.Empty);
    }
}

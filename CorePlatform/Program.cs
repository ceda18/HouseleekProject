/// ---------------------------------------------------------------
/// CorePlatform Directory
/// ---------------------------------------------------------------
/// Project: [Houseleek - Smart Home Management System]
/// ---------------------------------------------------------------
/// Author: [Čeda Veličković]
/// Date: [2026]
/// ---------------------------------------------------------------
/// Description:
/// This is the main entry point for the CorePlatform API, which serves as the backend
/// CorePlatform - The main API for the Houseleek smart home management system.
/// This API provides endpoints for managing users, units, rooms, items, and more.
/// It also includes services for handling business logic and database interactions.
/// ---------------------------------------------------------------
/// Note:
/// This code is intended for demonstration purposes and may not include all best practices or security measures.
/// This is a simplified example for demonstration purposes.
/// In a real application, you would likely have more complex logic, error handling, and security measures in place.

using CorePlatform.src.Data;
using CorePlatform.src.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Builder

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// JWT AUTHENTICATION
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });
builder.Services.AddAuthorization();

// DATABASE CONNECTION
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CorePlatform")));

builder.Services.AddDbContext<AgentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Agent")));

// CONTROLLERS
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient("AgentService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AgentService:Url"]!);
    client.DefaultRequestHeaders.Add("X-Agent-Api-Key", builder.Configuration["AgentService:ApiKey"]!);
});

// SERVICES
// Authentification
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
// AI Agent
builder.Services.AddScoped<IAIAgentService, AIAgentService>();
// User Management
builder.Services.AddScoped<IUserService, UserService>();
// Home Management
builder.Services.AddScoped<IUnitService, UnitService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IItemService, ItemService>();
// Catalog
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IItemModelService, ItemModelService>();
// Smart Workflow Management
builder.Services.AddScoped<ISceneService, SceneService>();
builder.Services.AddScoped<IAutomationService, AutomationService>();
// Action Management
builder.Services.AddScoped<IActionService, ActionService>();


// APP BUILDING
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.MapControllers();

//////

app.Run();

// Aaaand action!
// [Status]: 100% done, ready to run!

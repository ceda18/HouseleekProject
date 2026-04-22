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

// Builder

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// DATABASE CONNECTION
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CorePlatform")));

builder.Services.AddDbContext<AgentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Agent")));

// CONTROLLERS
builder.Services.AddControllers();

// SERVICES
// Home Management
builder.Services.AddScoped<IUserService, UserService>();
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

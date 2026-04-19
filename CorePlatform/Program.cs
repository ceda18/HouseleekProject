using CorePlatform.src.Data;
using CorePlatform.src.DTOs;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

// Builder

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("CorePlatform")));

builder.Services.AddDbContext<AgentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Agent")));

// App

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// TEST
// ActionDefinition
app.MapGet("/action-definitions", async (AppDbContext db) =>
{
    var result = await db.ActionDefinitions.ToListAsync();
    return Results.Ok(result.Select(ad => new ActionDefinitionResponse(ad)));
})
.WithOpenApi();

// ActionLog - Include za ItemState -> ActionDefinition zbog ValueType parsiranja
app.MapGet("/action-logs", async (AppDbContext db) =>
{
    var result = await db.ActionLogs
        .Include(al => al.ItemState)
            .ThenInclude(is_ => is_.ActionDefinition)
        .ToListAsync();
    return Results.Ok(result.Select(al => new ActionLogResponse(al)));
})
.WithOpenApi();

// AutomationTrigger
app.MapGet("/automation-triggers", async (AppDbContext db) =>
{
    var result = await db.AutomationTriggers.ToListAsync();
    return Results.Ok(result.Select(at => new AutomationTriggerResponse(at)));
})
.WithOpenApi();

// ItemState - Include za ActionDefinition zbog ValueType parsiranja
app.MapGet("/item-states", async (AppDbContext db) =>
{
    var result = await db.ItemStates
        .Include(is_ => is_.ActionDefinition)
        .ToListAsync();
    return Results.Ok(result.Select(is_ => new ItemStateResponse(is_)));
})
.WithOpenApi();

// SmartAction - Include za ItemState -> ActionDefinition zbog ValueType parsiranja
app.MapGet("/smart-actions", async (AppDbContext db) =>
{
    var result = await db.SmartActions
        .Include(sa => sa.ItemState)
            .ThenInclude(is_ => is_.ActionDefinition)
        .ToListAsync();
    return Results.Ok(result.Select(sa => new SmartActionResponse(sa)));
})
.WithOpenApi();

// AbstractUser
app.MapGet("/abstract-users", async (AppDbContext db) =>
{
    var result = await db.AbstractUsers.ToListAsync();
    return Results.Ok(result.Select(au => new AbstractUserResponse(au)));
})
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
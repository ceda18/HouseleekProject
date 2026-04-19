using CorePlatform.src.Data;
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

// CorePlatform - može JOIN sa User
app.MapGet("/test/core/workflows-with-user", async (AppDbContext db) =>
{
    var result = await db.SmartWorkflows
        .Include(sw => sw.User)
        .Select(sw => new {
            sw.SmartWorkflowId,
            sw.Name,
            sw.Type,
            UserName = sw.User.Name,
            UserSurname = sw.User.Surname
        })
        .ToListAsync();
    return Results.Ok(result);
})
.WithOpenApi();

// Agent - vidi workflows ali bez User podataka
app.MapGet("/test/agent/workflows-without-user", async (AgentDbContext db) =>
{
    var result = await db.SmartWorkflows
        .Select(sw => new {
            sw.SmartWorkflowId,
            sw.Name,
            sw.Type,
            UserName = sw.User.Name,
            UserSurname = sw.User.Surname // samo ID, ime/prezime nije dostupno
        })
        .ToListAsync();
    return Results.Ok(result);
})
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
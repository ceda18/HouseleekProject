using System;
using System.Collections.Generic;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Data;

// Main database context, containing all entities.
// This is used for the main API, which has read-write access to the database, and accesses all entities.

public class AppDbContext : BaseDbContext
{
    public AppDbContext()
    {
    }
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

}
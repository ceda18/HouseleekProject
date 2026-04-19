using System;
using System.Collections.Generic;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Data;

// Agent database context, containing only the grants that are shared between the AppDbContext and AgentDbContext.
// This is used for the Agent API, which has read-only access to the database, and does not access any entities that are specific to the main API (e.g. Admin, User).

public class AgentDbContext : BaseDbContext
{
    public AgentDbContext()
    {
    }
    public AgentDbContext(DbContextOptions<AgentDbContext> options)
        : base(options)
    {
    }

}

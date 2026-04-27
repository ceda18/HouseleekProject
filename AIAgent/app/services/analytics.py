"""
Analytics service — delegates SQL execution to CorePlatform.
CorePlatform runs the query via AgentDbContext (read-only DB user)
and returns the results. The agent never touches the database directly.
"""

from app.services.core_client import post


async def execute_analytics_query(sql: str) -> str:
    result = await post("/api/aiagent/analytics/execute", {"sql": sql})
    if isinstance(result, dict) and "error" in result:
        return f"Query failed: {result['error']}"
    return str(result)
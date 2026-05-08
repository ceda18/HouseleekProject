using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAIAgentService
{
    /// SO46 - Builds user snapshot, sends it to the agent service, returns existing history.</summary>
    Task<List<AgentMessageDto>> StartChat();

    /// SO47 - Forwards a user message to the agent service and returns the assistant reply.</summary>
    Task<AgentMessageDto?> SendMessage(string message);

    /// SO48 - Applies an agent proposal by delegating to the appropriate service.</summary>
    Task<bool> ApplyProposal(ApplyProposalRequest request);

    /// Returns the in-memory chat history for the current user.</summary>
    Task<List<AgentMessageDto>> GetHistory();

    /// SO49 - Clears in-memory history and notifies the agent service to drop the snapshot.</summary>
    Task<bool> ClearSession();

    /// Executes a read-only SQL query via AgentDbContext. Called by the agent service.</summary>
    Task<List<Dictionary<string, object?>>> ExecuteAnalyticsQuery(string sql);
}

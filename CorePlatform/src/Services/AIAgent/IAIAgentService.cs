using CorePlatform.src.DTOs;

namespace CorePlatform.src.Services;

public interface IAIAgentService
{
    // SO46 // START CHAT
    Task<List<AgentMessageDto>> StartChat();

    // SO47 // SEND MESSAGE
    Task<AgentMessageDto?> SendMessage(string message);

    // SO48 // APPLY PROPOSAL
    Task<bool> ApplyProposal(ApplyProposalRequest request);

    // AGENT PUBLIC HELPER //
    Task<List<AgentMessageDto>> GetHistory();

    // SO49 // CLEAR SESSION
    Task<bool> ClearSession();

    // AGENT PUBLIC HELPER //
    Task<List<Dictionary<string, object?>>> ExecuteAnalyticsQuery(string sql);
}

using System.Text.Json;
using System.Text.Json.Serialization;

namespace CorePlatform.src.DTOs;

// ─── OUTBOUND (UI → CorePlatform) ────────────────────────────────────────────

public class ChatMessageRequest
{
    public string Message { get; set; } = string.Empty;
}

public class ApplyProposalRequest
{
    public string Type { get; set; } = string.Empty;       // "scene" | "automation" | "item"
    public JsonElement Payload { get; set; }
}

public class AnalyticsRequest
{
    public string Sql { get; set; } = string.Empty;
}

// ─── CHAT HISTORY ─────────────────────────────────────────────────────────────

public class AgentMessageDto
{
    public string Role { get; set; } = string.Empty;       // "user" | "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public ProposalDto? Proposal { get; set; }
}

public class ProposalDto
{
    public string Type { get; set; } = string.Empty;       // "scene" | "automation" | "item"
    public JsonElement Payload { get; set; }
}

// ─── INTERNAL — deserializing AIAgent service responses ───────────────────────

internal class AgentServiceResponse
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("proposal")]
    public AgentServiceProposal? Proposal { get; set; }
}

internal class AgentServiceProposal
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("payload")]
    public JsonElement Payload { get; set; }
}

namespace CorePlatform.src.DTOs;

public class ActionLogDto
{
    public int ActionLogId { get; set; }
    public Guid ExecutionId { get; set; }
    public DateTime Timestamp { get; set; }
    public object TriggerSource { get; set; } = null!;
    public object PastValue { get; set; } = null!;
    public object CurrentValue { get; set; } = null!;
    public int? ItemStateId { get; set; }
    public int? SmartWorkflowId { get; set; }
}

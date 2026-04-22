
namespace CorePlatform.src.DTOs;

public class AutomationDto
{
    public int AutomationId { get; set; }
    public string Name { get; set; } = null!;
    public int UserId { get; set; }

    public List<AutomationTriggerDto> Triggers { get; set; } = new();
    public List<SmartActionDto> SmartActions { get; set; } = new();

    public class AutomationTriggerDto
    {
        public int AutomationTriggerId { get; set; }
        public string TriggerType { get; set; } = null!;
        public string ValueType { get; set; } = null!;
        public object Value { get; set; } = null!;
        public string? Operand { get; set; }

        // optional fields for item state triggers
        public int? ItemStateId { get; set; }
        public string? ItemName { get; set; }
        public string? ActionDefinitionName { get; set; }
        public string? ItemCategoryName { get; set; }
    }

    public class SmartActionDto
    {
        public int SmartActionId { get; set; }
        public object? Value { get; set; }

        // XOR // either item state change or scene activation
        public int? ItemStateId { get; set; }
        public string? ItemName { get; set; }
        public string? ActionDefinitionName { get; set; }
        public string? ValueType { get; set; }
        public string? ItemCategoryName { get; set; }

        public int? TargetSceneId { get; set; }
        public string? TargetSceneName { get; set; }
    }
}
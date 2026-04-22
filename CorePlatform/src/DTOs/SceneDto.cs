// SceneDto.cs
namespace CorePlatform.src.DTOs;

public class SceneDto
{
    public int SceneId { get; set; }
    public string Name { get; set; } = null!;
    public int UserId { get; set; }
    public List<SmartActionDto> SmartActions { get; set; } = new();

    public class SmartActionDto
    {
        public int SmartActionId { get; set; }
        public int? ItemStateId { get; set; }
        public string? ItemName { get; set; }
        public string? ItemCategoryName { get; set; }
        public string? ActionDefinitionName { get; set; }
        public string? ValueType { get; set; }
        public object? Value { get; set; }
    }
}
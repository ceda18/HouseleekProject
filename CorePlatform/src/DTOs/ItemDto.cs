// ItemDto.cs
using CorePlatform.src.Models;

namespace CorePlatform.src.DTOs;

public class ItemDto
{
    public int ItemId { get; set; }
    public string Name { get; set; } = null!;
    public int RoomId { get; set; }
    public int ItemModelId { get; set; }
    public string ItemModelName { get; set; } = null!;
    public string ItemCategoryName { get; set; } = null!;
    public List<ItemStateDto> ItemStates { get; set; } = new();

    public class ItemStateDto
    {
        public int ItemStateId { get; set; }
        public int ActionDefinitionId { get; set; }
        public string ActionDefinitionName { get; set; } = null!;
        public bool Controllable { get; set; }
        public string ValueType { get; set; } = null!;
        public object Value { get; set; } = null!;
    }
}
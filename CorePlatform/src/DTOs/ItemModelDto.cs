
namespace CorePlatform.src.DTOs;

public class ItemModelDto
{
    public int ItemModelId { get; set; }
    public string Name { get; set; } = null!;
    // public bool Published { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = null!;
    public int ItemCategoryId { get; set; }
    public string ItemCategoryName { get; set; } = null!;
    public List<ItemPropertyDto> ItemProperties { get; set; } = new();
    public List<ActionDefinitionDto> ActionDefinitions { get; set; } = new();

    public class ItemPropertyDto
    {
        public int ItemPropertyId { get; set; }
        public string Name { get; set; } = null!;
        public string? Value { get; set; }
    }

    public class ActionDefinitionDto
    {
        public int ActionDefinitionId { get; set; }
        public string Name { get; set; } = null!;
        public bool Controllable { get; set; }
        public string ValueType { get; set; } = null!;

    }
}
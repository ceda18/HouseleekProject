using CorePlatform.src.Models;
using CorePlatform.src.Utility;

namespace CorePlatform.src.DTOs;

public class ItemDto
{
    public int ItemId { get; set; }
    public string Name { get; set; } = null!;
    public int ItemModelId { get; set; }
    public int RoomId { get; set; }

    public List<ItemStateDto> ItemStates { get; set; } = new();

    public class ItemStateDto
    {
        public int ItemStateId { get; set; }
        public int ActionDefinitionId { get; set; }
        public object Value { get; set; } = null!;

        public ItemStateDto() { }

        public ItemStateDto(ItemState itemState)
        {
            ItemStateId = itemState.ItemStateId;
            ActionDefinitionId = itemState.ActionDefinitionId;
            Value = ValueTypeParser.ParseValue(itemState.Value, itemState.ActionDefinition.ValueType);
        }
    }

    public ItemDto Response(Item item)
    {
        ItemId = item.ItemId;
        Name = item.Name;
        ItemModelId = item.ItemModelId;
        RoomId = item.RoomId;
        ItemStates = item.ItemStates
            .Select(is_ => new ItemStateDto(is_))
            .ToList();
        return this;
    }

    public Item Request()
    {
        Item item = new Item();
        item.ItemId = this.ItemId;
        item.Name = this.Name;
        item.ItemModelId = this.ItemModelId;
        item.RoomId = this.RoomId;
        return item;
    }

}
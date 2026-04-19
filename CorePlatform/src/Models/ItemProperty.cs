using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class ItemProperty
{
    public int ItemPropertyId { get; set; }

    public int ItemModelId { get; set; }

    public string Name { get; set; } = null!;

    public string? Value { get; set; }

    public virtual ItemModel ItemModel { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Vendor
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Pseudonym { get; set; } = null!;

    public virtual ICollection<ItemModel> ItemModels { get; set; } = new List<ItemModel>();

    public virtual AbstractUser User { get; set; } = null!;
}

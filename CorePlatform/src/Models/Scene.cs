using System;
using System.Collections.Generic;

namespace CorePlatform.src.Models;

public partial class Scene
{
    public int SceneId { get; set; }

    public virtual SmartWorkflow SceneNavigation { get; set; } = null!;

    public virtual ICollection<SmartAction> SmartActions { get; set; } = new List<SmartAction>();
}

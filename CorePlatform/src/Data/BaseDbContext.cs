using System;
using System.Collections.Generic;
using CorePlatform.src.Models;
using Microsoft.EntityFrameworkCore;

namespace CorePlatform.src.Data;

// Base database context, containing all entities.
// This is used as a base class for both the AppDbContext and AgentDbContext.
// They represent different contexts with different access levels to the database.

public partial class BaseDbContext : DbContext
{
    public BaseDbContext()
    {
    }

    public BaseDbContext(DbContextOptions options)
        : base(options)
    {
    }

    public virtual DbSet<AbstractUser> AbstractUsers { get; set; }

    public virtual DbSet<ActionDefinition> ActionDefinitions { get; set; }

    public virtual DbSet<ActionLog> ActionLogs { get; set; }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Automation> Automations { get; set; }

    public virtual DbSet<AutomationTrigger> AutomationTriggers { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<ItemCategory> ItemCategories { get; set; }

    public virtual DbSet<ItemModel> ItemModels { get; set; }

    public virtual DbSet<ItemProperty> ItemProperties { get; set; }

    public virtual DbSet<ItemState> ItemStates { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<Scene> Scenes { get; set; }

    public virtual DbSet<SmartAction> SmartActions { get; set; }

    public virtual DbSet<SmartWorkflow> SmartWorkflows { get; set; }

    public virtual DbSet<Unit> Units { get; set; }

    public virtual DbSet<UnitType> UnitTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vendor> Vendors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AbstractUser>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("uq_abstract_user_id");

            entity.ToTable("abstract_user", "houseleek");

            entity.HasIndex(e => e.Email, "uq_abstract_user_email").IsUnique();

            entity.Property(e => e.UserId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("user_id");
            entity.Property(e => e.Email)
                .HasColumnType("character varying")
                .HasColumnName("email");
            entity.Property(e => e.Password)
                .HasColumnType("character varying")
                .HasColumnName("password");
        });

        modelBuilder.Entity<ActionDefinition>(entity =>
        {
            entity.HasKey(e => new { e.ActionDefinitionId, e.ItemModelId }).HasName("pk_action_definition");

            entity.ToTable("action_definition", "houseleek");

            entity.HasIndex(e => e.ActionDefinitionId, "uq_action_definition_id").IsUnique();

            entity.Property(e => e.ActionDefinitionId)
                .ValueGeneratedOnAdd()
                .UseIdentityAlwaysColumn()
                .HasColumnName("action_definition_id");
            entity.Property(e => e.ItemModelId).HasColumnName("item_model_id");
            entity.Property(e => e.Controllable).HasColumnName("controllable");
            entity.Property(e => e.DefaultValue)
                .HasColumnType("character varying")
                .HasColumnName("default_value");
            entity.Property(e => e.MaxValue).HasColumnName("max_value");
            entity.Property(e => e.MinValue).HasColumnName("min_value");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.ValueType)
                .HasColumnType("character varying")
                .HasColumnName("value_type");

            entity.HasOne(d => d.ItemModel).WithMany(p => p.ActionDefinitions)
                .HasForeignKey(d => d.ItemModelId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_action_definition_item_model");
        });

        modelBuilder.Entity<ActionLog>(entity =>
        {
            entity.HasKey(e => e.ActionLogId).HasName("uq_action_log_id");

            entity.ToTable("action_log", "houseleek");

            entity.Property(e => e.ActionLogId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("action_log_id");
            entity.Property(e => e.CurrentValue)
                .HasColumnType("character varying")
                .HasColumnName("current_value");
            entity.Property(e => e.ExecutionId).HasColumnName("execution_id");
            entity.Property(e => e.ItemStateId).HasColumnName("item_state_id");
            entity.Property(e => e.PastValue)
                .HasColumnType("character varying")
                .HasColumnName("past_value");
            entity.Property(e => e.SmartWorkflowId).HasColumnName("smart_workflow_id");
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.TriggerSource)
                .HasColumnType("jsonb")
                .HasColumnName("trigger_source");

            entity.HasOne(d => d.ItemState).WithMany(p => p.ActionLogs)
                .HasPrincipalKey(p => p.ItemStateId)
                .HasForeignKey(d => d.ItemStateId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_action_log_item_state");

            entity.HasOne(d => d.SmartWorkflow).WithMany(p => p.ActionLogs)
                .HasForeignKey(d => d.SmartWorkflowId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_action_log_smart_workflow");
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("admin_pkey");

            entity.ToTable("admin", "houseleek");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Surname)
                .HasColumnType("character varying")
                .HasColumnName("surname");

            entity.HasOne(d => d.User).WithOne(p => p.Admin)
                .HasForeignKey<Admin>(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_admin_abstract_user");
        });

        modelBuilder.Entity<Automation>(entity =>
        {
            entity.HasKey(e => e.AutomationId).HasName("automation_pkey");

            entity.ToTable("automation", "houseleek");

            entity.Property(e => e.AutomationId)
                .ValueGeneratedNever()
                .HasColumnName("automation_id");

            entity.HasOne(d => d.AutomationNavigation).WithOne(p => p.Automation)
                .HasForeignKey<Automation>(d => d.AutomationId)
                .HasConstraintName("fk_automation_smart_workflow");
        });

        modelBuilder.Entity<AutomationTrigger>(entity =>
        {
            entity.HasKey(e => new { e.AutomationTriggerId, e.AutomationId }).HasName("pk_automation_trigger");

            entity.ToTable("automation_trigger", "houseleek");

            entity.HasIndex(e => e.AutomationTriggerId, "uq_automation_trigger_id").IsUnique();

            entity.Property(e => e.AutomationTriggerId)
                .ValueGeneratedOnAdd()
                .UseIdentityAlwaysColumn()
                .HasColumnName("automation_trigger_id");
            entity.Property(e => e.AutomationId).HasColumnName("automation_id");
            entity.Property(e => e.ItemStateId).HasColumnName("item_state_id");
            entity.Property(e => e.Operand)
                .HasColumnType("character varying")
                .HasColumnName("operand");
            entity.Property(e => e.TriggerType)
                .HasColumnType("character varying")
                .HasColumnName("trigger_type");
            entity.Property(e => e.Value)
                .HasColumnType("character varying")
                .HasColumnName("value");
            entity.Property(e => e.ValueType)
                .HasColumnType("character varying")
                .HasColumnName("value_type");

            entity.HasOne(d => d.Automation).WithMany(p => p.AutomationTriggers)
                .HasForeignKey(d => d.AutomationId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_automation_trigger_automation");

            entity.HasOne(d => d.ItemState).WithMany(p => p.AutomationTriggers)
                .HasPrincipalKey(p => p.ItemStateId)
                .HasForeignKey(d => d.ItemStateId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_automation_trigger_item_state");
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("uq_item_id");

            entity.ToTable("item", "houseleek");

            entity.Property(e => e.ItemId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("item_id");
            entity.Property(e => e.ItemModelId).HasColumnName("item_model_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.RoomId).HasColumnName("room_id");

            entity.HasOne(d => d.ItemModel).WithMany(p => p.Items)
                .HasForeignKey(d => d.ItemModelId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_item_model");

            entity.HasOne(d => d.Room).WithMany(p => p.Items)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_room");
        });

        modelBuilder.Entity<ItemCategory>(entity =>
        {
            entity.HasKey(e => e.ItemCategoryId).HasName("item_category_pkey");

            entity.ToTable("item_category", "houseleek");

            entity.Property(e => e.ItemCategoryId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("item_category_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
        });

        modelBuilder.Entity<ItemModel>(entity =>
        {
            entity.HasKey(e => e.ItemModelId).HasName("uq_item_model_id");

            entity.ToTable("item_model", "houseleek");

            entity.Property(e => e.ItemModelId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("item_model_id");
            entity.Property(e => e.ItemCategoryId).HasColumnName("item_category_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Published).HasColumnName("published");
            entity.Property(e => e.VendorId).HasColumnName("vendor_id");

            entity.HasOne(d => d.ItemCategory).WithMany(p => p.ItemModels)
                .HasForeignKey(d => d.ItemCategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_model_item_category");

            entity.HasOne(d => d.Vendor).WithMany(p => p.ItemModels)
                .HasForeignKey(d => d.VendorId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_model_vendor");
        });

        modelBuilder.Entity<ItemProperty>(entity =>
        {
            entity.HasKey(e => new { e.ItemPropertyId, e.ItemModelId }).HasName("pk_item_property");

            entity.ToTable("item_property", "houseleek");

            entity.Property(e => e.ItemPropertyId)
                .ValueGeneratedOnAdd()
                .UseIdentityAlwaysColumn()
                .HasColumnName("item_property_id");
            entity.Property(e => e.ItemModelId).HasColumnName("item_model_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Value).HasColumnName("value");

            entity.HasOne(d => d.ItemModel).WithMany(p => p.ItemProperties)
                .HasForeignKey(d => d.ItemModelId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_property_item_model");
        });

        modelBuilder.Entity<ItemState>(entity =>
        {
            entity.HasKey(e => new { e.ItemStateId, e.ActionDefinitionId, e.ItemId }).HasName("pk_item_state");

            entity.ToTable("item_state", "houseleek");

            entity.HasIndex(e => e.ItemStateId, "uq_item_state_id").IsUnique();

            entity.Property(e => e.ItemStateId)
                .ValueGeneratedOnAdd()
                .UseIdentityAlwaysColumn()
                .HasColumnName("item_state_id");
            entity.Property(e => e.ActionDefinitionId).HasColumnName("action_definition_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.Value)
                .HasColumnType("character varying")
                .HasColumnName("value");

            entity.HasOne(d => d.ActionDefinition).WithMany(p => p.ItemStates)
                .HasPrincipalKey(p => p.ActionDefinitionId)
                .HasForeignKey(d => d.ActionDefinitionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_state_action_def");

            entity.HasOne(d => d.Item).WithMany(p => p.ItemStates)
                .HasForeignKey(d => d.ItemId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_item_state_item");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("uq_room_id");

            entity.ToTable("room", "houseleek");

            entity.Property(e => e.RoomId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("room_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");
            entity.Property(e => e.UnitId).HasColumnName("unit_id");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_room_room_type");

            entity.HasOne(d => d.Unit).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.UnitId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_room_unit");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.RoomTypeId).HasName("room_type_pkey");

            entity.ToTable("room_type", "houseleek");

            entity.Property(e => e.RoomTypeId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("room_type_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
        });

        modelBuilder.Entity<Scene>(entity =>
        {
            entity.HasKey(e => e.SceneId).HasName("scene_pkey");

            entity.ToTable("scene", "houseleek");

            entity.Property(e => e.SceneId)
                .ValueGeneratedNever()
                .HasColumnName("scene_id");

            entity.HasOne(d => d.SceneNavigation).WithOne(p => p.Scene)
                .HasForeignKey<Scene>(d => d.SceneId)
                .HasConstraintName("fk_scene_smart_workflow");
        });

        modelBuilder.Entity<SmartAction>(entity =>
        {
            entity.HasKey(e => new { e.SmartActionId, e.SmartWorkflowId }).HasName("pk_smart_action");

            entity.ToTable("smart_action", "houseleek");

            entity.HasIndex(e => e.SmartActionId, "uq_smart_action_id").IsUnique();

            entity.Property(e => e.SmartActionId)
                .ValueGeneratedOnAdd()
                .UseIdentityAlwaysColumn()
                .HasColumnName("smart_action_id");
            entity.Property(e => e.SmartWorkflowId).HasColumnName("smart_workflow_id");
            entity.Property(e => e.ItemStateId).HasColumnName("item_state_id");
            entity.Property(e => e.TargetSceneId).HasColumnName("target_scene_id");
            entity.Property(e => e.Value)
                .HasColumnType("character varying")
                .HasColumnName("value");

            entity.HasOne(d => d.ItemState).WithMany(p => p.SmartActions)
                .HasPrincipalKey(p => p.ItemStateId)
                .HasForeignKey(d => d.ItemStateId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_smart_action_item_state");

            entity.HasOne(d => d.SmartWorkflow).WithMany(p => p.SmartActions)
                .HasForeignKey(d => d.SmartWorkflowId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_smart_action_workflow");

            entity.HasOne(d => d.TargetScene).WithMany(p => p.SmartActions)
                .HasForeignKey(d => d.TargetSceneId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_smart_action_scene");
        });

        modelBuilder.Entity<SmartWorkflow>(entity =>
        {
            entity.HasKey(e => e.SmartWorkflowId).HasName("uq_smart_workflow_id");

            entity.ToTable("smart_workflow", "houseleek");

            entity.Property(e => e.SmartWorkflowId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("smart_workflow_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Type)
                .HasColumnType("character varying")
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.SmartWorkflows)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_smart_workflow_user");
        });

        modelBuilder.Entity<Unit>(entity =>
        {
            entity.HasKey(e => e.UnitId).HasName("uq_unit_id");

            entity.ToTable("unit", "houseleek");

            entity.Property(e => e.UnitId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("unit_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.UnitTypeId).HasColumnName("unit_type_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.UnitType).WithMany(p => p.Units)
                .HasForeignKey(d => d.UnitTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_unit_unit_type");

            entity.HasOne(d => d.User).WithMany(p => p.Units)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_unit_user");
        });

        modelBuilder.Entity<UnitType>(entity =>
        {
            entity.HasKey(e => e.UnitTypeId).HasName("unit_type_pkey");

            entity.ToTable("unit_type", "houseleek");

            entity.Property(e => e.UnitTypeId)
                .UseIdentityAlwaysColumn()
                .HasColumnName("unit_type_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("user_pkey");

            entity.ToTable("user", "houseleek");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Surname)
                .HasColumnType("character varying")
                .HasColumnName("surname");

            entity.HasOne(d => d.UserNavigation).WithOne(p => p.User)
                .HasForeignKey<User>(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_user_abstract_user");
        });

        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("vendor_pkey");

            entity.ToTable("vendor", "houseleek");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Pseudonym)
                .HasColumnType("character varying")
                .HasColumnName("pseudonym");

            entity.HasOne(d => d.User).WithOne(p => p.Vendor)
                .HasForeignKey<Vendor>(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_vendor_abstract_user");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

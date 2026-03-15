using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Configurations;

internal static class NotificationConfigurationExtensions
{
    public static void ConfigureNotification<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : NotificationEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("notification_templates");
        builder.ConfigureNotification();
        builder.Property(x => x.Code).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Channel).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Subject).HasMaxLength(256).IsRequired();
        builder.Property(x => x.TemplateBody).HasColumnType("text").IsRequired();
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.HasIndex(x => new { x.Code, x.Channel }).IsUnique();
        builder.HasData(NotificationTemplateCatalog.GetSeedTemplates());
    }
}

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.ConfigureNotification();
        builder.Property(x => x.Channel).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.PayloadJson).HasColumnType("text").IsRequired();
        builder.HasIndex(x => new { x.Status, x.CreatedAt });
        builder.HasIndex(x => new { x.UserId, x.CreatedAt });
        builder.HasOne(x => x.Template).WithMany(x => x.Notifications).HasForeignKey(x => x.TemplateId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.ToTable("notification_logs");
        builder.ConfigureNotification();
        builder.Property(x => x.ProviderResponse).HasColumnType("text").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => new { x.NotificationId, x.CreatedAt });
        builder.HasOne(x => x.Notification).WithMany(x => x.Logs).HasForeignKey(x => x.NotificationId).OnDelete(DeleteBehavior.Cascade);
    }
}

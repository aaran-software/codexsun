using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Monitoring.Entities;

namespace cxserver.Modules.Monitoring.Configurations;

internal static class MonitoringConfigurationExtensions
{
    public static void ConfigureMonitoring<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : MonitoringEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

public sealed class SystemLogConfiguration : IEntityTypeConfiguration<SystemLog>
{
    public void Configure(EntityTypeBuilder<SystemLog> builder)
    {
        builder.ToTable("system_logs");
        builder.ConfigureMonitoring();
        builder.Property(x => x.Service).HasMaxLength(100).IsRequired();
        builder.Property(x => x.EventType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Message).HasColumnType("text").IsRequired();
        builder.Property(x => x.Details).HasColumnType("text").HasDefaultValue(string.Empty);
        builder.Property(x => x.Severity).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Service);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.Service, x.Severity, x.CreatedAt });
    }
}

public sealed class ErrorLogConfiguration : IEntityTypeConfiguration<ErrorLog>
{
    public void Configure(EntityTypeBuilder<ErrorLog> builder)
    {
        builder.ToTable("error_logs");
        builder.ConfigureMonitoring();
        builder.Property(x => x.Service).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ExceptionMessage).HasColumnType("text").IsRequired();
        builder.Property(x => x.StackTrace).HasColumnType("text").HasDefaultValue(string.Empty);
        builder.Property(x => x.Source).HasMaxLength(200).HasDefaultValue(string.Empty);
        builder.Property(x => x.Path).HasMaxLength(300).HasDefaultValue(string.Empty);
        builder.Property(x => x.IpAddress).HasMaxLength(100).HasDefaultValue(string.Empty);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.Service, x.CreatedAt });
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class LoginHistoryConfiguration : IEntityTypeConfiguration<LoginHistory>
{
    public void Configure(EntityTypeBuilder<LoginHistory> builder)
    {
        builder.ToTable("login_history");
        builder.ConfigureMonitoring();
        builder.Property(x => x.Email).HasMaxLength(200).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Device).HasMaxLength(200).HasDefaultValue(string.Empty);
        builder.Property(x => x.Browser).HasMaxLength(200).HasDefaultValue(string.Empty);
        builder.Property(x => x.OS).HasMaxLength(200).HasDefaultValue(string.Empty);
        builder.Property(x => x.LoginStatus).HasMaxLength(50).IsRequired();
        builder.Property(x => x.LoginTime).IsRequired();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.LoginTime);
        builder.HasIndex(x => new { x.UserId, x.LoginTime });
        builder.HasIndex(x => new { x.IpAddress, x.LoginTime });
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}

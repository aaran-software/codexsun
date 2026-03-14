using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.System.Entities;

namespace cxserver.Modules.System.Configurations;

internal static class SystemEntityConfigurationExtensions
{
    public static void ConfigureSystem<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : SystemEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.HasIndex(x => x.IsActive);
    }
}

internal static class SystemSeed
{
    internal static readonly DateTimeOffset Utc = new(2026, 03, 14, 0, 0, 0, TimeSpan.Zero);
}

public sealed class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("system_settings");
        builder.ConfigureSystem();
        builder.Property(x => x.Key).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Value).HasMaxLength(512).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Key).IsUnique();
        builder.HasData(
            new SystemSetting
            {
                Id = 1,
                Key = "site_name",
                Value = "Codexsun",
                Description = "Default application site name",
                IsActive = true,
                CreatedAt = SystemSeed.Utc,
                UpdatedAt = SystemSeed.Utc,
            });
    }
}

public sealed class NumberSeriesConfiguration : IEntityTypeConfiguration<NumberSeries>
{
    public void Configure(EntityTypeBuilder<NumberSeries> builder)
    {
        builder.ToTable("number_series");
        builder.ConfigureSystem();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Prefix).HasMaxLength(32).IsRequired();
        builder.Property(x => x.NextNumber).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new NumberSeries
            {
                Id = 1,
                Name = "-",
                Prefix = "-",
                NextNumber = 1,
                IsActive = true,
                CreatedAt = SystemSeed.Utc,
                UpdatedAt = SystemSeed.Utc,
            },
            new NumberSeries
            {
                Id = 2,
                Name = "Sales Order",
                Prefix = "SO",
                NextNumber = 1001,
                IsActive = true,
                CreatedAt = SystemSeed.Utc,
                UpdatedAt = SystemSeed.Utc,
            });
    }
}

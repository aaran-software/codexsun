using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

internal static class CommonEntityConfigurationExtensions
{
    public static void ConfigureCommon<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : CommonMasterEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.HasIndex(x => x.IsActive);
    }

    public static void ConfigureNamed<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : NamedCommonMasterEntity
    {
        builder.ConfigureCommon();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Name);
    }
}

internal static class Seed
{
    internal static readonly DateTimeOffset Utc = new(2026, 03, 14, 0, 0, 0, TimeSpan.Zero);
}

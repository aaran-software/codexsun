using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Shipping.Entities;

namespace cxserver.Modules.Shipping.Configurations;

internal static class ShippingConfigurationExtensions
{
    public static void ConfigureShipping<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : ShippingEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class ShippingProviderConfiguration : IEntityTypeConfiguration<ShippingProvider>
{
    public void Configure(EntityTypeBuilder<ShippingProvider> builder)
    {
        builder.ToTable("shipping_providers");
        builder.ConfigureShipping();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.TrackingUrl).HasMaxLength(512).HasDefaultValue(string.Empty);
        builder.Property(x => x.ContactEmail).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.ContactPhone).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new ShippingProvider
            {
                Id = 1,
                Name = "Codexsun Logistics",
                TrackingUrl = "https://tracking.codexsun.local/{tracking}",
                ContactEmail = "logistics@codexsun.local",
                ContactPhone = "+91-0000-000000",
                CreatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero)
            });
    }
}

public sealed class ShippingMethodConfiguration : IEntityTypeConfiguration<ShippingMethod>
{
    public void Configure(EntityTypeBuilder<ShippingMethod> builder)
    {
        builder.ToTable("shipping_methods");
        builder.ConfigureShipping();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.BaseCost).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.CostPerKg).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.ProviderId, x.Name }).IsUnique();
        builder.HasOne(x => x.Provider).WithMany(x => x.Methods).HasForeignKey(x => x.ProviderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasData(
            new ShippingMethod
            {
                Id = 1,
                Name = "Standard Delivery",
                ProviderId = 1,
                BaseCost = 50m,
                CostPerKg = 10m,
                EstimatedDays = 5,
                CreatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero)
            },
            new ShippingMethod
            {
                Id = 2,
                Name = "Express Delivery",
                ProviderId = 1,
                BaseCost = 120m,
                CostPerKg = 20m,
                EstimatedDays = 2,
                CreatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero),
                UpdatedAt = new DateTimeOffset(2026, 03, 15, 0, 0, 0, TimeSpan.Zero)
            });
    }
}

public sealed class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("shipments");
        builder.ConfigureShipping();
        builder.Property(x => x.TrackingNumber).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.TrackingNumber).IsUnique();
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ShippingMethod).WithMany(x => x.Shipments).HasForeignKey(x => x.ShippingMethodId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ShipmentItemConfiguration : IEntityTypeConfiguration<ShipmentItem>
{
    public void Configure(EntityTypeBuilder<ShipmentItem> builder)
    {
        builder.ToTable("shipment_items");
        builder.ConfigureShipping();
        builder.HasIndex(x => new { x.ShipmentId, x.OrderItemId }).IsUnique();
        builder.HasOne(x => x.Shipment).WithMany(x => x.Items).HasForeignKey(x => x.ShipmentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.OrderItem).WithMany().HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Restrict);
    }
}

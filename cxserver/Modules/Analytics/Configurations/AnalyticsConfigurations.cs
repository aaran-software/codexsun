using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Analytics.Entities;

namespace cxserver.Modules.Analytics.Configurations;

internal static class AnalyticsConfigurationExtensions
{
    public static void ConfigureAnalytics<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : AnalyticsEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class VendorSalesSummaryConfiguration : IEntityTypeConfiguration<VendorSalesSummary>
{
    public void Configure(EntityTypeBuilder<VendorSalesSummary> builder)
    {
        builder.ToTable("vendor_sales_summary");
        builder.ConfigureAnalytics();
        builder.Property(x => x.TotalSales).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.TotalEarnings).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.VendorId, x.PeriodStart, x.PeriodEnd }).IsUnique();
        builder.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductSalesSummaryConfiguration : IEntityTypeConfiguration<ProductSalesSummary>
{
    public void Configure(EntityTypeBuilder<ProductSalesSummary> builder)
    {
        builder.ToTable("product_sales_summary");
        builder.ConfigureAnalytics();
        builder.Property(x => x.TotalRevenue).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.ProductId, x.PeriodStart, x.PeriodEnd }).IsUnique();
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

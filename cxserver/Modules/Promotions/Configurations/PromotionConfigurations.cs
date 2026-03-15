using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Promotions.Entities;

namespace cxserver.Modules.Promotions.Configurations;

internal static class PromotionConfigurationExtensions
{
    public static void ConfigurePromotion<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : PromotionEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
{
    public void Configure(EntityTypeBuilder<Promotion> builder)
    {
        builder.ToTable("promotions");
        builder.ConfigurePromotion();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1024).HasDefaultValue(string.Empty);
        builder.Property(x => x.DiscountType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.DiscountValue).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.IsActive, x.StartDate, x.EndDate });
    }
}

public sealed class PromotionProductConfiguration : IEntityTypeConfiguration<PromotionProduct>
{
    public void Configure(EntityTypeBuilder<PromotionProduct> builder)
    {
        builder.ToTable("promotion_products");
        builder.ConfigurePromotion();
        builder.HasIndex(x => new { x.PromotionId, x.ProductId }).IsUnique();
        builder.HasOne(x => x.Promotion).WithMany(x => x.Products).HasForeignKey(x => x.PromotionId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("coupons");
        builder.ConfigurePromotion();
        builder.Property(x => x.Code).HasMaxLength(64).IsRequired();
        builder.Property(x => x.DiscountType).HasMaxLength(32).IsRequired();
        builder.Property(x => x.DiscountValue).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => new { x.IsActive, x.StartDate, x.EndDate });
    }
}

public sealed class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
{
    public void Configure(EntityTypeBuilder<CouponUsage> builder)
    {
        builder.ToTable("coupon_usages");
        builder.ConfigurePromotion();
        builder.HasIndex(x => new { x.CouponId, x.OrderId }).IsUnique();
        builder.HasOne(x => x.Coupon).WithMany(x => x.Usages).HasForeignKey(x => x.CouponId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

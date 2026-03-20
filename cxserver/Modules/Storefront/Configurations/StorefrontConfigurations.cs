using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Storefront.Entities;

namespace cxserver.Modules.Storefront.Configurations;

internal static class StorefrontConfigurationExtensions
{
    public static void ConfigureStorefront<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : StorefrontEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class WishlistEntryConfiguration : IEntityTypeConfiguration<WishlistEntry>
{
    public void Configure(EntityTypeBuilder<WishlistEntry> builder)
    {
        builder.ToTable("wishlist_entries");
        builder.ConfigureStorefront();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany(x => x.WishlistEntries).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.ToTable("product_reviews");
        builder.ConfigureStorefront();
        builder.Property(x => x.Title).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Review).HasMaxLength(2048).IsRequired();
        builder.Property(x => x.Rating).IsRequired();
        builder.Property(x => x.IsApproved).HasDefaultValue(true);
        builder.Property(x => x.IsVerifiedPurchase).HasDefaultValue(false);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.ProductId, x.IsApproved, x.CreatedAt });
        builder.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Product).WithMany(x => x.Reviews).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("customer_addresses");
        builder.ConfigureStorefront();
        builder.Property(x => x.Label).HasMaxLength(80).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AddressLine1).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AddressLine2).HasMaxLength(256);
        builder.Property(x => x.City).HasMaxLength(128).IsRequired();
        builder.Property(x => x.State).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Country).HasMaxLength(128).IsRequired();
        builder.Property(x => x.PostalCode).HasMaxLength(32).IsRequired();
        builder.Property(x => x.IsDefault).HasDefaultValue(false);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.UserId, x.IsDefault });
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

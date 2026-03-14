using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Products.Entities;

namespace cxserver.Modules.Products.Configurations;

internal static class ProductConfigurationExtensions
{
    public static void ConfigureProduct<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : ProductEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.HasIndex(x => x.IsActive);
    }
}

public sealed class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("product_categories");
        builder.ConfigureProduct();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(160).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.Slug).IsUnique();
    }
}

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.ConfigureProduct();
        builder.Property(x => x.Sku).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(256).IsRequired();
        builder.Property(x => x.ShortDescription).HasMaxLength(512).HasDefaultValue(string.Empty);
        builder.Property(x => x.Description).HasMaxLength(4096).HasDefaultValue(string.Empty);
        builder.Property(x => x.BasePrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.CostPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => x.Sku).IsUnique();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => new { x.OwnerUserId, x.IsActive });
        builder.HasIndex(x => new { x.VendorUserId, x.IsActive });
        builder.HasOne(x => x.OwnerUser).WithMany().HasForeignKey(x => x.OwnerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Group).WithMany().HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Type).WithMany().HasForeignKey(x => x.TypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Unit).WithMany().HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.GstPercent).WithMany().HasForeignKey(x => x.GstPercentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Brand).WithMany().HasForeignKey(x => x.BrandId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HsnCode).WithMany().HasForeignKey(x => x.HsnCodeId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.ConfigureProduct();
        builder.Property(x => x.Sku).HasMaxLength(64).IsRequired();
        builder.Property(x => x.VariantName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Price).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.CostPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => x.Sku).IsUnique();
        builder.HasOne(x => x.Product).WithMany(x => x.Variants).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductPriceConfiguration : IEntityTypeConfiguration<ProductPrice>
{
    public void Configure(EntityTypeBuilder<ProductPrice> builder)
    {
        builder.ToTable("product_prices");
        builder.ConfigureProduct();
        builder.Property(x => x.PriceType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasOne(x => x.Product).WithMany(x => x.Prices).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images");
        builder.ConfigureProduct();
        builder.Property(x => x.ImageUrl).HasMaxLength(1024).IsRequired();
        builder.Property(x => x.AltText).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.HasOne(x => x.Product).WithMany(x => x.Images).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductInventoryConfiguration : IEntityTypeConfiguration<ProductInventory>
{
    public void Configure(EntityTypeBuilder<ProductInventory> builder)
    {
        builder.ToTable("product_inventory");
        builder.ConfigureProduct();
        builder.HasIndex(x => new { x.ProductId, x.WarehouseId }).IsUnique();
        builder.HasOne(x => x.Product).WithMany(x => x.Inventory).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ProductVendorLinkConfiguration : IEntityTypeConfiguration<ProductVendorLink>
{
    public void Configure(EntityTypeBuilder<ProductVendorLink> builder)
    {
        builder.ToTable("product_vendor_links");
        builder.ConfigureProduct();
        builder.Property(x => x.VendorSku).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.VendorSpecificPrice).HasColumnType("numeric(18,2)").IsRequired();
        builder.HasIndex(x => new { x.ProductId, x.VendorUserId }).IsUnique();
        builder.HasOne(x => x.Product).WithMany(x => x.VendorLinks).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("product_attributes");
        builder.ConfigureProduct();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.HasOne(x => x.Product).WithMany(x => x.Attributes).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ProductAttributeValueConfiguration : IEntityTypeConfiguration<ProductAttributeValue>
{
    public void Configure(EntityTypeBuilder<ProductAttributeValue> builder)
    {
        builder.ToTable("product_attribute_values");
        builder.ConfigureProduct();
        builder.Property(x => x.Value).HasMaxLength(256).IsRequired();
        builder.HasOne(x => x.ProductAttribute).WithMany(x => x.Values).HasForeignKey(x => x.ProductAttributeId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ProductVariant).WithMany(x => x.AttributeValues).HasForeignKey(x => x.ProductVariantId).OnDelete(DeleteBehavior.Cascade);
    }
}

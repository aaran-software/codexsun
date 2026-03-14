using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

public sealed class ContactTypeConfiguration : IEntityTypeConfiguration<ContactType>
{
    public void Configure(EntityTypeBuilder<ContactType> builder)
    {
        builder.ToTable("contact_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.ContactTypes);
    }
}

public sealed class ProductTypeConfiguration : IEntityTypeConfiguration<ProductType>
{
    public void Configure(EntityTypeBuilder<ProductType> builder)
    {
        builder.ToTable("product_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.ProductTypes);
    }
}

public sealed class ProductGroupConfiguration : IEntityTypeConfiguration<ProductGroup>
{
    public void Configure(EntityTypeBuilder<ProductGroup> builder)
    {
        builder.ToTable("product_groups");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.ProductGroups);
    }
}

public sealed class HsnCodeConfiguration : IEntityTypeConfiguration<HsnCode>
{
    public void Configure(EntityTypeBuilder<HsnCode> builder)
    {
        builder.ToTable("hsncodes");
        builder.ConfigureCommon();
        builder.Property(x => x.Code).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasData(ProductSeedData.HsnCodes);
    }
}

public sealed class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");
        builder.ConfigureNamed();
        builder.Property(x => x.ShortName).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.ShortName).IsUnique();
        builder.HasData(ProductSeedData.Units);
    }
}

public sealed class GstPercentConfiguration : IEntityTypeConfiguration<GstPercent>
{
    public void Configure(EntityTypeBuilder<GstPercent> builder)
    {
        builder.ToTable("gst_percents");
        builder.ConfigureCommon();
        builder.Property(x => x.Percentage).HasColumnType("numeric(5,2)").IsRequired();
        builder.HasIndex(x => x.Percentage).IsUnique();
        builder.HasData(ProductSeedData.GstPercents);
    }
}

public sealed class ColourConfiguration : IEntityTypeConfiguration<Colour>
{
    public void Configure(EntityTypeBuilder<Colour> builder)
    {
        builder.ToTable("colours");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.Colours);
    }
}

public sealed class SizeConfiguration : IEntityTypeConfiguration<Size>
{
    public void Configure(EntityTypeBuilder<Size> builder)
    {
        builder.ToTable("sizes");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.Sizes);
    }
}

public sealed class OrderTypeConfiguration : IEntityTypeConfiguration<OrderType>
{
    public void Configure(EntityTypeBuilder<OrderType> builder)
    {
        builder.ToTable("order_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.OrderTypes);
    }
}

public sealed class StyleConfiguration : IEntityTypeConfiguration<Style>
{
    public void Configure(EntityTypeBuilder<Style> builder)
    {
        builder.ToTable("styles");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.Styles);
    }
}

public sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("brands");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(ProductSeedData.Brands);
    }
}

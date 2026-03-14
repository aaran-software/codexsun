using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

public sealed class ContactTypeConfiguration : IEntityTypeConfiguration<ContactType>
{
    public void Configure(EntityTypeBuilder<ContactType> builder)
    {
        builder.ToTable("common_contact_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasData(
            new ContactType { Id = 1, Name = "Customer", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new ContactType { Id = 2, Name = "Vendor", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new ContactType { Id = 3, Name = "Supplier", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new ContactType { Id = 4, Name = "Employee", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class ProductTypeConfiguration : IEntityTypeConfiguration<ProductType>
{
    public void Configure(EntityTypeBuilder<ProductType> builder)
    {
        builder.ToTable("common_product_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class ProductGroupConfiguration : IEntityTypeConfiguration<ProductGroup>
{
    public void Configure(EntityTypeBuilder<ProductGroup> builder)
    {
        builder.ToTable("common_product_groups");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class HsnCodeConfiguration : IEntityTypeConfiguration<HsnCode>
{
    public void Configure(EntityTypeBuilder<HsnCode> builder)
    {
        builder.ToTable("common_hsn_codes");
        builder.ConfigureCommon();
        builder.Property(x => x.Code).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("common_units");
        builder.ConfigureNamed();
        builder.Property(x => x.ShortName).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.ShortName).IsUnique();
        builder.HasData(
            new Unit { Id = 1, Name = "Numbers", ShortName = "Nos", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new Unit { Id = 2, Name = "Kilogram", ShortName = "Kg", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new Unit { Id = 3, Name = "Meter", ShortName = "Mtr", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class GstPercentConfiguration : IEntityTypeConfiguration<GstPercent>
{
    public void Configure(EntityTypeBuilder<GstPercent> builder)
    {
        builder.ToTable("common_gst_percents");
        builder.ConfigureCommon();
        builder.Property(x => x.Percentage).HasColumnType("numeric(5,2)").IsRequired();
        builder.HasIndex(x => x.Percentage).IsUnique();
        builder.HasData(
            new GstPercent { Id = 1, Percentage = 0m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new GstPercent { Id = 2, Percentage = 5m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new GstPercent { Id = 3, Percentage = 12m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new GstPercent { Id = 4, Percentage = 18m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new GstPercent { Id = 5, Percentage = 28m, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class ColourConfiguration : IEntityTypeConfiguration<Colour>
{
    public void Configure(EntityTypeBuilder<Colour> builder)
    {
        builder.ToTable("common_colours");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class SizeConfiguration : IEntityTypeConfiguration<Size>
{
    public void Configure(EntityTypeBuilder<Size> builder)
    {
        builder.ToTable("common_sizes");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class OrderTypeConfiguration : IEntityTypeConfiguration<OrderType>
{
    public void Configure(EntityTypeBuilder<OrderType> builder)
    {
        builder.ToTable("common_order_types");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class StyleConfiguration : IEntityTypeConfiguration<Style>
{
    public void Configure(EntityTypeBuilder<Style> builder)
    {
        builder.ToTable("common_styles");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("common_brands");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

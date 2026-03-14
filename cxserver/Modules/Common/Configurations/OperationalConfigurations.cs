using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

public sealed class TransportConfiguration : IEntityTypeConfiguration<Transport>
{
    public void Configure(EntityTypeBuilder<Transport> builder)
    {
        builder.ToTable("transports");
        builder.ConfigureNamed();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class DestinationConfiguration : IEntityTypeConfiguration<Destination>
{
    public void Configure(EntityTypeBuilder<Destination> builder)
    {
        builder.ToTable("destinations");
        builder.ConfigureNamed();
        builder.HasIndex(x => new { x.Name, x.CountryId, x.CityId }).IsUnique();
        builder.HasOne(x => x.Country).WithMany(x => x.Destinations).HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.City).WithMany(x => x.Destinations).HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("currencies");
        builder.ConfigureNamed();
        builder.Property(x => x.Code).HasMaxLength(16).IsRequired();
        builder.Property(x => x.Symbol).HasMaxLength(16).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");
        builder.ConfigureNamed();
        builder.Property(x => x.Location).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class PaymentTermConfiguration : IEntityTypeConfiguration<PaymentTerm>
{
    public void Configure(EntityTypeBuilder<PaymentTerm> builder)
    {
        builder.ToTable("payment_terms");
        builder.ConfigureNamed();
        builder.Property(x => x.Days).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
        builder.HasIndex(x => x.Days);
    }
}

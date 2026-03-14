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
        builder.HasData(
            new Transport { Id = 1, Name = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
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
        builder.HasData(
            new Destination { Id = 1, Name = "-", CountryId = 1, CityId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
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
        builder.HasData(
            new Currency { Id = 1, Name = "-", Code = "-", Symbol = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
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
        builder.HasData(
            new Warehouse { Id = 1, Name = "-", Location = "-", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
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
        builder.HasData(
            new PaymentTerm { Id = 1, Name = "-", Days = 0, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Common.Configurations;

public sealed class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.ToTable("countries");
        builder.ConfigureNamed();
        builder.Property(x => x.CountryCode).HasMaxLength(8).IsRequired();
        builder.HasIndex(x => x.CountryCode).IsUnique();
        builder.HasIndex(x => x.Name).IsUnique();

        builder.HasData(
            new Country { Id = 1, Name = "-", CountryCode = "--", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new Country { Id = 2, Name = "India", CountryCode = "IN", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new Country { Id = 3, Name = "United States", CountryCode = "US", IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class StateConfiguration : IEntityTypeConfiguration<State>
{
    public void Configure(EntityTypeBuilder<State> builder)
    {
        builder.ToTable("states");
        builder.ConfigureNamed();
        builder.Property(x => x.StateCode).HasMaxLength(16).IsRequired();
        builder.HasIndex(x => new { x.CountryId, x.Name }).IsUnique();
        builder.HasIndex(x => new { x.CountryId, x.StateCode }).IsUnique();
        builder.HasOne(x => x.Country).WithMany(x => x.States).HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new State { Id = 1, Name = "-", StateCode = "-", CountryId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new State { Id = 2, Name = "Tamil Nadu", StateCode = "TN", CountryId = 2, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new State { Id = 3, Name = "Karnataka", StateCode = "KA", CountryId = 2, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc },
            new State { Id = 4, Name = "California", StateCode = "CA", CountryId = 3, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class DistrictConfiguration : IEntityTypeConfiguration<District>
{
    public void Configure(EntityTypeBuilder<District> builder)
    {
        builder.ToTable("districts");
        builder.ConfigureNamed();
        builder.HasIndex(x => new { x.StateId, x.Name }).IsUnique();
        builder.HasOne(x => x.State).WithMany(x => x.Districts).HasForeignKey(x => x.StateId).OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new District { Id = 1, Name = "-", StateId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class CityConfiguration : IEntityTypeConfiguration<City>
{
    public void Configure(EntityTypeBuilder<City> builder)
    {
        builder.ToTable("cities");
        builder.ConfigureNamed();
        builder.HasIndex(x => new { x.DistrictId, x.Name }).IsUnique();
        builder.HasOne(x => x.District).WithMany(x => x.Cities).HasForeignKey(x => x.DistrictId).OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new City { Id = 1, Name = "-", DistrictId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

public sealed class PincodeConfiguration : IEntityTypeConfiguration<Pincode>
{
    public void Configure(EntityTypeBuilder<Pincode> builder)
    {
        builder.ToTable("pincodes");
        builder.ConfigureCommon();
        builder.Property(x => x.Code).HasMaxLength(16).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasOne(x => x.City).WithMany(x => x.Pincodes).HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new Pincode { Id = 1, Code = "-", CityId = 1, IsActive = true, CreatedAt = Seed.Utc, UpdatedAt = Seed.Utc });
    }
}

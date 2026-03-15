using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Company.Entities;
using CompanyAggregate = cxserver.Modules.Company.Entities.Company;

namespace cxserver.Modules.Company.Configurations;

internal static class CompanyConfigurationExtensions
{
    public static void ConfigureCompany<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : CompanyEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

internal static class CompanySeedData
{
    public static readonly DateTimeOffset Utc = new(2026, 3, 15, 0, 0, 0, TimeSpan.Zero);

    public static readonly CompanyAggregate Company = new()
    {
        Id = 1,
        DisplayName = "CXStore",
        LegalName = "CXStore Platform Private Limited",
        BillingName = "CXStore Platform Private Limited",
        CompanyCode = "CXSTORE",
        Email = "hello@cxstore.local",
        Phone = "+91 00000 00000",
        Website = "https://cxstore.local",
        SupportEmail = "support@cxstore.local",
        GstNumber = string.Empty,
        PanNumber = string.Empty,
        LogoMediaId = null,
        FaviconMediaId = null,
        CurrencyId = 2,
        Timezone = "Asia/Calcutta",
        CreatedAt = Utc,
        UpdatedAt = Utc
    };

    public static readonly CompanyAddress Address = new()
    {
        Id = 1,
        CompanyId = 1,
        AddressLine1 = string.Empty,
        AddressLine2 = string.Empty,
        CountryId = 1,
        StateId = 1,
        CityId = 1,
        PincodeId = 1,
        IsPrimary = true,
        CreatedAt = Utc,
        UpdatedAt = Utc
    };

    public static readonly CompanySetting[] Settings =
    [
        new CompanySetting
        {
            Id = 1,
            CompanyId = 1,
            SettingKey = "default_language",
            SettingValue = "en-IN",
            SettingGroup = "Localization",
            CreatedAt = Utc,
            UpdatedAt = Utc
        },
        new CompanySetting
        {
            Id = 2,
            CompanyId = 1,
            SettingKey = "order_prefix",
            SettingValue = "SO",
            SettingGroup = "Documents",
            CreatedAt = Utc,
            UpdatedAt = Utc
        },
        new CompanySetting
        {
            Id = 3,
            CompanyId = 1,
            SettingKey = "invoice_prefix",
            SettingValue = "INV",
            SettingGroup = "Documents",
            CreatedAt = Utc,
            UpdatedAt = Utc
        },
        new CompanySetting
        {
            Id = 4,
            CompanyId = 1,
            SettingKey = "date_format",
            SettingValue = "dd MMM yyyy",
            SettingGroup = "Localization",
            CreatedAt = Utc,
            UpdatedAt = Utc
        }
    ];
}

public sealed class CompanyConfiguration : IEntityTypeConfiguration<CompanyAggregate>
{
    public void Configure(EntityTypeBuilder<CompanyAggregate> builder)
    {
        builder.ToTable("companies");
        builder.ConfigureCompany();
        builder.Property(x => x.DisplayName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.LegalName).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.BillingName).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.CompanyCode).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.Email).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.Phone).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.Website).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.SupportEmail).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.GstNumber).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.PanNumber).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.Timezone).HasMaxLength(128).HasDefaultValue("UTC");
        builder.HasIndex(x => x.CompanyCode).IsUnique();
        builder.HasOne(x => x.LogoMedia).WithMany().HasForeignKey(x => x.LogoMediaId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.FaviconMedia).WithMany().HasForeignKey(x => x.FaviconMediaId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasData(CompanySeedData.Company);
    }
}

public sealed class CompanyAddressConfiguration : IEntityTypeConfiguration<CompanyAddress>
{
    public void Configure(EntityTypeBuilder<CompanyAddress> builder)
    {
        builder.ToTable("company_addresses");
        builder.ConfigureCompany();
        builder.Property(x => x.AddressLine1).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.AddressLine2).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.IsPrimary).HasDefaultValue(true);
        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => new { x.CompanyId, x.IsPrimary });
        builder.HasOne(x => x.Company).WithMany(x => x.Addresses).HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Country).WithMany().HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.State).WithMany().HasForeignKey(x => x.StateId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.City).WithMany().HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Pincode).WithMany().HasForeignKey(x => x.PincodeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasData(CompanySeedData.Address);
    }
}

public sealed class CompanySettingConfiguration : IEntityTypeConfiguration<CompanySetting>
{
    public void Configure(EntityTypeBuilder<CompanySetting> builder)
    {
        builder.ToTable("company_settings");
        builder.ConfigureCompany();
        builder.Property(x => x.SettingKey).HasMaxLength(128).IsRequired();
        builder.Property(x => x.SettingValue).HasMaxLength(2048).HasDefaultValue(string.Empty);
        builder.Property(x => x.SettingGroup).HasMaxLength(128).HasDefaultValue("General");
        builder.HasIndex(x => new { x.CompanyId, x.SettingKey }).IsUnique();
        builder.HasIndex(x => x.SettingGroup);
        builder.HasOne(x => x.Company).WithMany(x => x.Settings).HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);
        builder.HasData(CompanySeedData.Settings);
    }
}

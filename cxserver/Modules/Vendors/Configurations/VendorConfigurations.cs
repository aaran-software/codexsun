using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Vendors.Configurations;

internal static class VendorConfigurationExtensions
{
    public static void ConfigureVendor<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : VendorEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

public sealed class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("vendors");
        builder.ConfigureVendor();
        builder.Property(x => x.CompanyName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.LegalName).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.GstNumber).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.PanNumber).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.Email).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.Phone).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.Property(x => x.Website).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.LogoUrl).HasMaxLength(1024).HasDefaultValue(string.Empty);
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.CompanyName);
        builder.HasIndex(x => x.Email);
        builder.HasIndex(x => x.Status);
    }
}

public sealed class VendorUserConfiguration : IEntityTypeConfiguration<VendorUser>
{
    public void Configure(EntityTypeBuilder<VendorUser> builder)
    {
        builder.ToTable("vendor_users");
        builder.ConfigureVendor();
        builder.Property(x => x.Role).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => new { x.VendorId, x.UserId }).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.Vendor).WithMany(x => x.Users).HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VendorAddressConfiguration : IEntityTypeConfiguration<VendorAddress>
{
    public void Configure(EntityTypeBuilder<VendorAddress> builder)
    {
        builder.ToTable("vendor_addresses");
        builder.ConfigureVendor();
        builder.Property(x => x.AddressLine1).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AddressLine2).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.HasIndex(x => x.VendorId);
        builder.HasOne(x => x.Vendor).WithMany(x => x.Addresses).HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Country).WithMany().HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.State).WithMany().HasForeignKey(x => x.StateId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.District).WithMany().HasForeignKey(x => x.DistrictId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.City).WithMany().HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Pincode).WithMany().HasForeignKey(x => x.PincodeId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class VendorBankAccountConfiguration : IEntityTypeConfiguration<VendorBankAccount>
{
    public void Configure(EntityTypeBuilder<VendorBankAccount> builder)
    {
        builder.ToTable("vendor_bank_accounts");
        builder.ConfigureVendor();
        builder.Property(x => x.AccountName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AccountNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.IfscCode).HasMaxLength(32).HasDefaultValue(string.Empty);
        builder.Property(x => x.IsPrimary).HasDefaultValue(false);
        builder.HasIndex(x => x.VendorId);
        builder.HasOne(x => x.Vendor).WithMany(x => x.BankAccounts).HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Bank).WithMany().HasForeignKey(x => x.BankId).OnDelete(DeleteBehavior.Restrict);
    }
}

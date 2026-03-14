using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Contacts.Entities;

namespace cxserver.Modules.Contacts.Configurations;

internal static class ContactConfigurationExtensions
{
    public static void ConfigureContact<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : ContactEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.HasIndex(x => x.IsActive);
    }
}

public sealed class ContactGroupConfiguration : IEntityTypeConfiguration<ContactGroup>
{
    public void Configure(EntityTypeBuilder<ContactGroup> builder)
    {
        builder.ToTable("contact_groups");
        builder.ConfigureContact();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public sealed class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.ToTable("contacts");
        builder.ConfigureContact();
        builder.Property(x => x.FirstName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(128).HasDefaultValue(string.Empty);
        builder.Property(x => x.DisplayName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.TaxNumber).HasMaxLength(64).HasDefaultValue(string.Empty);
        builder.HasIndex(x => x.DisplayName);
        builder.HasIndex(x => new { x.OwnerUserId, x.IsActive });
        builder.HasIndex(x => new { x.VendorUserId, x.IsActive });
        builder.HasOne(x => x.OwnerUser).WithMany().HasForeignKey(x => x.OwnerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.VendorUser).WithMany().HasForeignKey(x => x.VendorUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ContactType).WithMany().HasForeignKey(x => x.ContactTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Group).WithMany(x => x.Contacts).HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.SetNull);
    }
}

public sealed class ContactAddressConfiguration : IEntityTypeConfiguration<ContactAddress>
{
    public void Configure(EntityTypeBuilder<ContactAddress> builder)
    {
        builder.ToTable("contact_addresses");
        builder.ConfigureContact();
        builder.Property(x => x.AddressType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.AddressLine1).HasMaxLength(256).IsRequired();
        builder.Property(x => x.AddressLine2).HasMaxLength(256).HasDefaultValue(string.Empty);
        builder.Property(x => x.PostalCode).HasMaxLength(32).HasDefaultValue(string.Empty);
        builder.HasIndex(x => new { x.ContactId, x.IsPrimary });
        builder.HasOne(x => x.Contact).WithMany(x => x.Addresses).HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Country).WithMany().HasForeignKey(x => x.CountryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.State).WithMany().HasForeignKey(x => x.StateId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.District).WithMany().HasForeignKey(x => x.DistrictId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.City).WithMany().HasForeignKey(x => x.CityId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ContactEmailConfiguration : IEntityTypeConfiguration<ContactEmail>
{
    public void Configure(EntityTypeBuilder<ContactEmail> builder)
    {
        builder.ToTable("contact_emails");
        builder.ConfigureContact();
        builder.Property(x => x.Label).HasMaxLength(64).HasDefaultValue("Primary");
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Email);
        builder.HasIndex(x => new { x.ContactId, x.IsPrimary });
        builder.HasOne(x => x.Contact).WithMany(x => x.Emails).HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ContactPhoneConfiguration : IEntityTypeConfiguration<ContactPhone>
{
    public void Configure(EntityTypeBuilder<ContactPhone> builder)
    {
        builder.ToTable("contact_phones");
        builder.ConfigureContact();
        builder.Property(x => x.Label).HasMaxLength(64).HasDefaultValue("Primary");
        builder.Property(x => x.PhoneNumber).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.PhoneNumber);
        builder.HasIndex(x => new { x.ContactId, x.IsPrimary });
        builder.HasOne(x => x.Contact).WithMany(x => x.Phones).HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ContactNoteConfiguration : IEntityTypeConfiguration<ContactNote>
{
    public void Configure(EntityTypeBuilder<ContactNote> builder)
    {
        builder.ToTable("contact_notes");
        builder.ConfigureContact();
        builder.Property(x => x.Note).HasMaxLength(2048).IsRequired();
        builder.HasOne(x => x.Contact).WithMany(x => x.Notes).HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
    }
}

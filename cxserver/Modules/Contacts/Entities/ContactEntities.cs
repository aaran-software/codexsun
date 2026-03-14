using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;

namespace cxserver.Modules.Contacts.Entities;

public abstract class ContactEntity
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class ContactGroup : ContactEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<Contact> Contacts { get; set; } = [];
}

public sealed class Contact : ContactEntity
{
    public Guid OwnerUserId { get; set; }
    public User OwnerUser { get; set; } = null!;
    public Guid? VendorUserId { get; set; }
    public User? VendorUser { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int? ContactTypeId { get; set; }
    public ContactType? ContactType { get; set; }
    public int? GroupId { get; set; }
    public ContactGroup? Group { get; set; }
    public string TaxNumber { get; set; } = string.Empty;
    public bool IsBusiness { get; set; }
    public bool IsCustomer { get; set; }
    public bool IsSupplier { get; set; }
    public bool IsVendorContact { get; set; }
    public ICollection<ContactAddress> Addresses { get; set; } = [];
    public ICollection<ContactEmail> Emails { get; set; } = [];
    public ICollection<ContactPhone> Phones { get; set; } = [];
    public ICollection<ContactNote> Notes { get; set; } = [];
}

public sealed class ContactAddress : ContactEntity
{
    public int ContactId { get; set; }
    public Contact Contact { get; set; } = null!;
    public string AddressType { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public Country? Country { get; set; }
    public int? StateId { get; set; }
    public State? State { get; set; }
    public int? DistrictId { get; set; }
    public District? District { get; set; }
    public int? CityId { get; set; }
    public City? City { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactEmail : ContactEntity
{
    public int ContactId { get; set; }
    public Contact Contact { get; set; } = null!;
    public string Label { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactPhone : ContactEntity
{
    public int ContactId { get; set; }
    public Contact Contact { get; set; } = null!;
    public string Label { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactNote : ContactEntity
{
    public int ContactId { get; set; }
    public Contact Contact { get; set; } = null!;
    public string Note { get; set; } = string.Empty;
}

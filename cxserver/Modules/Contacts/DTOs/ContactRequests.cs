namespace cxserver.Modules.Contacts.DTOs;

public sealed class ContactAddressRequest
{
    public string AddressType { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public int? StateId { get; set; }
    public int? DistrictId { get; set; }
    public int? CityId { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactEmailRequest
{
    public string Label { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactPhoneRequest
{
    public string Label { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class ContactNoteRequest
{
    public string Note { get; set; } = string.Empty;
}

public sealed class ContactUpsertRequest
{
    public Guid? VendorUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int? ContactTypeId { get; set; }
    public int? GroupId { get; set; }
    public string TaxNumber { get; set; } = string.Empty;
    public bool IsBusiness { get; set; }
    public bool IsCustomer { get; set; }
    public bool IsSupplier { get; set; }
    public bool IsVendorContact { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ContactAddressRequest> Addresses { get; set; } = [];
    public List<ContactEmailRequest> Emails { get; set; } = [];
    public List<ContactPhoneRequest> Phones { get; set; } = [];
    public List<ContactNoteRequest> Notes { get; set; } = [];
}

public sealed class ContactLookupResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public sealed class ContactGroupUpsertRequest
{
    public string Name { get; set; } = string.Empty;
}

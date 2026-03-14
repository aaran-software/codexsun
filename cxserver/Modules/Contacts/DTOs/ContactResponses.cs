namespace cxserver.Modules.Contacts.DTOs;

public sealed class ContactAddressResponse
{
    public int Id { get; init; }
    public string AddressType { get; init; } = string.Empty;
    public int? CountryId { get; init; }
    public string? CountryName { get; init; }
    public int? StateId { get; init; }
    public string? StateName { get; init; }
    public int? DistrictId { get; init; }
    public string? DistrictName { get; init; }
    public int? CityId { get; init; }
    public string? CityName { get; init; }
    public string AddressLine1 { get; init; } = string.Empty;
    public string AddressLine2 { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
}

public sealed class ContactEmailResponse
{
    public int Id { get; init; }
    public string Label { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
}

public sealed class ContactPhoneResponse
{
    public int Id { get; init; }
    public string Label { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
}

public sealed class ContactNoteResponse
{
    public int Id { get; init; }
    public string Note { get; init; } = string.Empty;
}

public class ContactListItemResponse
{
    public int Id { get; init; }
    public Guid OwnerUserId { get; init; }
    public Guid? VendorUserId { get; init; }
    public string VendorName { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public int? ContactTypeId { get; init; }
    public string ContactTypeName { get; init; } = string.Empty;
    public int? GroupId { get; init; }
    public string GroupName { get; init; } = string.Empty;
    public string TaxNumber { get; init; } = string.Empty;
    public bool IsBusiness { get; init; }
    public bool IsCustomer { get; init; }
    public bool IsSupplier { get; init; }
    public bool IsVendorContact { get; init; }
    public bool IsActive { get; init; }
    public string PrimaryEmail { get; init; } = string.Empty;
    public string PrimaryPhone { get; init; } = string.Empty;
    public string PrimaryCity { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class ContactDetailResponse : ContactListItemResponse
{
    public IReadOnlyList<ContactAddressResponse> Addresses { get; init; } = [];
    public IReadOnlyList<ContactEmailResponse> Emails { get; init; } = [];
    public IReadOnlyList<ContactPhoneResponse> Phones { get; init; } = [];
    public IReadOnlyList<ContactNoteResponse> Notes { get; init; } = [];
}

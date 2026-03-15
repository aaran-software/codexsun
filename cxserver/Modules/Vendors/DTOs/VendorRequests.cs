namespace cxserver.Modules.Vendors.DTOs;

public sealed class VendorAddressRequest
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public int? StateId { get; set; }
    public int? DistrictId { get; set; }
    public int? CityId { get; set; }
    public int? PincodeId { get; set; }
}

public sealed class VendorBankAccountRequest
{
    public int? BankId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public sealed class VendorUpsertRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public List<VendorAddressRequest> Addresses { get; set; } = [];
    public List<VendorBankAccountRequest> BankAccounts { get; set; } = [];
}

public sealed class AssignVendorUserRequest
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
}

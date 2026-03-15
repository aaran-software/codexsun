namespace cxserver.Modules.Vendors.DTOs;

public sealed class VendorUserResponse
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class VendorAddressResponse
{
    public int Id { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public int? StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public int? DistrictId { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public int? CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public int? PincodeId { get; set; }
    public string PincodeValue { get; set; } = string.Empty;
}

public sealed class VendorBankAccountResponse
{
    public int Id { get; set; }
    public int? BankId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public class VendorSummaryResponse
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class VendorDetailResponse : VendorSummaryResponse
{
    public List<VendorUserResponse> Users { get; set; } = [];
    public List<VendorAddressResponse> Addresses { get; set; } = [];
    public List<VendorBankAccountResponse> BankAccounts { get; set; } = [];
}

using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Common.Entities;
using cxserver.Modules.Finance.Entities;

namespace cxserver.Modules.Vendors.Entities;

public abstract class VendorEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Vendor : VendorEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public ICollection<VendorUser> Users { get; set; } = [];
    public ICollection<VendorAddress> Addresses { get; set; } = [];
    public ICollection<VendorBankAccount> BankAccounts { get; set; } = [];
}

public sealed class VendorUser : VendorEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Role { get; set; } = string.Empty;
}

public sealed class VendorAddress : VendorEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public Country? Country { get; set; }
    public int? StateId { get; set; }
    public State? State { get; set; }
    public int? DistrictId { get; set; }
    public District? District { get; set; }
    public int? CityId { get; set; }
    public City? City { get; set; }
    public int? PincodeId { get; set; }
    public Pincode? Pincode { get; set; }
}

public sealed class VendorBankAccount : VendorEntity
{
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int? BankId { get; set; }
    public Bank? Bank { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string IfscCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

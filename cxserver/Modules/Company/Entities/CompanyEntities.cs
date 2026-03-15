using cxserver.Modules.Common.Entities;
using cxserver.Modules.Media.Entities;

namespace cxserver.Modules.Company.Entities;

public abstract class CompanyEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class Company : CompanyEntity
{
    public string DisplayName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string BillingName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string SupportEmail { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public int? LogoMediaId { get; set; }
    public MediaFile? LogoMedia { get; set; }
    public int? FaviconMediaId { get; set; }
    public MediaFile? FaviconMedia { get; set; }
    public int? CurrencyId { get; set; }
    public Currency? Currency { get; set; }
    public string Timezone { get; set; } = string.Empty;
    public ICollection<CompanyAddress> Addresses { get; set; } = [];
    public ICollection<CompanySetting> Settings { get; set; } = [];
}

public sealed class CompanyAddress : CompanyEntity
{
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public Country? Country { get; set; }
    public int? StateId { get; set; }
    public State? State { get; set; }
    public int? CityId { get; set; }
    public City? City { get; set; }
    public int? PincodeId { get; set; }
    public Pincode? Pincode { get; set; }
    public bool IsPrimary { get; set; }
}

public sealed class CompanySetting : CompanyEntity
{
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string SettingGroup { get; set; } = string.Empty;
}

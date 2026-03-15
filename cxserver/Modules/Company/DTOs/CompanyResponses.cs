namespace cxserver.Modules.Company.DTOs;

public sealed class CompanyAddressResponse
{
    public int Id { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public int? StateId { get; set; }
    public string StateName { get; set; } = string.Empty;
    public int? CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public int? PincodeId { get; set; }
    public string PincodeValue { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class CompanySettingResponse
{
    public int Id { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string SettingGroup { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class CompanyResponse
{
    public int Id { get; set; }
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
    public string LogoUrl { get; set; } = string.Empty;
    public int? FaviconMediaId { get; set; }
    public string FaviconUrl { get; set; } = string.Empty;
    public int? CurrencyId { get; set; }
    public string CurrencyName { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public CompanyAddressResponse? Address { get; set; }
    public List<CompanySettingResponse> Settings { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

namespace cxserver.Modules.Company.DTOs;

public sealed class CompanyAddressUpsertRequest
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public int? StateId { get; set; }
    public int? CityId { get; set; }
    public int? PincodeId { get; set; }
    public bool IsPrimary { get; set; } = true;
}

public sealed class CompanyUpsertRequest
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
    public int? FaviconMediaId { get; set; }
    public int? CurrencyId { get; set; }
    public string Timezone { get; set; } = string.Empty;
    public CompanyAddressUpsertRequest Address { get; set; } = new();
}

public sealed class CompanySettingUpsertRequest
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string SettingGroup { get; set; } = string.Empty;
}

public sealed class CompanySettingsUpdateRequest
{
    public List<CompanySettingUpsertRequest> Settings { get; set; } = [];
}

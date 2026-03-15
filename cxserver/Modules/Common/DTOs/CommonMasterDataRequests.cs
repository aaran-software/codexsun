namespace cxserver.Modules.Common.DTOs;

public sealed class NameMasterUpsertRequest
{
    public string Name { get; set; } = string.Empty;
}

public sealed class StateUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string StateCode { get; set; } = string.Empty;
    public int CountryId { get; set; }
}

public sealed class DistrictUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public int StateId { get; set; }
}

public sealed class CityUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public int DistrictId { get; set; }
}

public sealed class PincodeUpsertRequest
{
    public string Code { get; set; } = string.Empty;
    public int CityId { get; set; }
}

public sealed class HsnCodeUpsertRequest
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public sealed class UnitUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
}

public sealed class GstPercentUpsertRequest
{
    public decimal Percentage { get; set; }
}

public sealed class DestinationUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public int? CityId { get; set; }
}

public sealed class CurrencyUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}

public sealed class WarehouseUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? VendorId { get; set; }
}

public sealed class PaymentTermUpsertRequest
{
    public string Name { get; set; } = string.Empty;
    public int Days { get; set; }
}

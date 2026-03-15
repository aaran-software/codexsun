using cxserver.Modules.Vendors.Entities;

namespace cxserver.Modules.Common.Entities;

public sealed class Transport : NamedCommonMasterEntity;

public sealed class Destination : NamedCommonMasterEntity
{
    public int? CountryId { get; set; }
    public Country? Country { get; set; }
    public int? CityId { get; set; }
    public City? City { get; set; }
}

public sealed class Currency : NamedCommonMasterEntity
{
    public string Code { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}

public sealed class Warehouse : NamedCommonMasterEntity
{
    public string Location { get; set; } = string.Empty;
    public int? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
}

public sealed class PaymentTerm : NamedCommonMasterEntity
{
    public int Days { get; set; }
}

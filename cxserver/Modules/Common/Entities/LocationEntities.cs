namespace cxserver.Modules.Common.Entities;

public sealed class Country : NamedCommonMasterEntity
{
    public ICollection<State> States { get; set; } = [];
    public ICollection<Destination> Destinations { get; set; } = [];
}

public sealed class State : NamedCommonMasterEntity
{
    public string StateCode { get; set; } = string.Empty;
    public int CountryId { get; set; }
    public Country Country { get; set; } = null!;
    public ICollection<District> Districts { get; set; } = [];
}

public sealed class District : NamedCommonMasterEntity
{
    public int StateId { get; set; }
    public State State { get; set; } = null!;
    public ICollection<City> Cities { get; set; } = [];
}

public sealed class City : NamedCommonMasterEntity
{
    public int DistrictId { get; set; }
    public District District { get; set; } = null!;
    public ICollection<Pincode> Pincodes { get; set; } = [];
    public ICollection<Destination> Destinations { get; set; } = [];
}

public sealed class Pincode : CommonMasterEntity
{
    public string Code { get; set; } = string.Empty;
    public int CityId { get; set; }
    public City City { get; set; } = null!;
}

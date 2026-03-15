namespace cxserver.Modules.Common.DTOs;

public sealed class CommonMasterDataResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? ShortName { get; init; }
    public decimal? Percentage { get; init; }
    public string? Symbol { get; init; }
    public string? Location { get; init; }
    public int? VendorId { get; init; }
    public string? VendorCompanyName { get; init; }
    public int? Days { get; init; }
    public int? CountryId { get; init; }
    public string? CountryName { get; init; }
    public int? StateId { get; init; }
    public string? StateName { get; init; }
    public int? DistrictId { get; init; }
    public string? DistrictName { get; init; }
    public int? CityId { get; init; }
    public string? CityName { get; init; }
    public bool IsActive { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class CommonSearchItemResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

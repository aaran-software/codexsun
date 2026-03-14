using System.Net;
using System.Net.Http.Json;
using cxtest.AuthSecurityTests;

namespace cxtest;

public sealed class CommonMasterDataTests
{
    [Fact]
    public async Task Admin_can_list_seeded_common_master_data()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        SetAdminBearerToken(factory, client);

        var countriesResponse = await client.GetAsync("/common/countries");
        countriesResponse.EnsureSuccessStatusCode();

        var countries = await countriesResponse.Content.ReadFromJsonAsync<List<CommonRecord>>();
        Assert.NotNull(countries);
        Assert.Contains(countries, x => x.Name == "India");
        Assert.Contains(countries, x => x.Name == "United States");

        var gstSearchResponse = await client.GetAsync("/common/gst-percents/search?q=18");
        gstSearchResponse.EnsureSuccessStatusCode();

        var gstItems = await gstSearchResponse.Content.ReadFromJsonAsync<List<SearchItem>>();
        Assert.NotNull(gstItems);
        Assert.Contains(gstItems, x => x.Name == "18.00");
    }

    [Fact]
    public async Task Admin_can_create_search_and_toggle_location_masters()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        SetAdminBearerToken(factory, client);

        var suffix = Guid.NewGuid().ToString("N")[..6];
        var districtName = $"Test District {suffix}";
        var cityName = $"Test City {suffix}";
        var pinCode = $"9{Random.Shared.Next(10000, 99999)}";

        var districtResponse = await client.PostAsJsonAsync("/common/districts", new
        {
            Name = districtName,
            StateId = 1
        });
        districtResponse.EnsureSuccessStatusCode();

        var district = await districtResponse.Content.ReadFromJsonAsync<CommonRecord>();
        Assert.NotNull(district);

        var cityResponse = await client.PostAsJsonAsync("/common/cities", new
        {
            Name = cityName,
            DistrictId = district.Id
        });
        cityResponse.EnsureSuccessStatusCode();

        var city = await cityResponse.Content.ReadFromJsonAsync<CommonRecord>();
        Assert.NotNull(city);

        var pincodeResponse = await client.PostAsJsonAsync("/common/pincodes", new
        {
            Code = pinCode,
            CityId = city.Id
        });
        pincodeResponse.EnsureSuccessStatusCode();

        var citySearchResponse = await client.GetAsync($"/common/cities/search?q={Uri.EscapeDataString(cityName)}");
        citySearchResponse.EnsureSuccessStatusCode();
        var citySearch = await citySearchResponse.Content.ReadFromJsonAsync<List<SearchItem>>();
        Assert.NotNull(citySearch);
        Assert.Contains(citySearch, x => x.Name == cityName);

        var deactivateResponse = await client.PostAsync($"/common/cities/{city.Id}/deactivate", content: null);
        Assert.Equal(HttpStatusCode.NoContent, deactivateResponse.StatusCode);

        var cityListResponse = await client.GetAsync($"/common/cities?districtId={district.Id}");
        cityListResponse.EnsureSuccessStatusCode();
        var cities = await cityListResponse.Content.ReadFromJsonAsync<List<CommonRecord>>();
        Assert.NotNull(cities);
        Assert.Contains(cities, x => x.Id == city.Id && x.IsActive == false);
    }

    private static void SetAdminBearerToken(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory, HttpClient client)
    {
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["User.Read"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
    }

    private sealed class CommonRecord
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    private sealed class SearchItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}

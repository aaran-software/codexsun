using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;

namespace cxtest;

public sealed class CompanyModuleTests
{
    [Fact]
    public async Task Public_company_profile_and_admin_updates_use_central_company_module()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var publicClient = AuthSecurityTestSupport.CreateClient(factory);
        using var adminClient = CreateAdminClient(factory);

        using var uploadContent = new MultipartFormDataContent();
        var imageBytes = System.Text.Encoding.UTF8.GetBytes("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><rect width=\"16\" height=\"16\" fill=\"#112233\"/></svg>");
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/svg+xml");
        uploadContent.Add(fileContent, "file", "company-logo.svg");
        uploadContent.Add(new StringContent("company"), "module");
        uploadContent.Add(new StringContent("1"), "entityId");
        uploadContent.Add(new StringContent("Company"), "entityType");
        uploadContent.Add(new StringContent("company logo"), "usageType");

        var uploadResponse = await adminClient.PostAsync("/media/upload", uploadContent);
        uploadResponse.EnsureSuccessStatusCode();
        var media = await AuthSecurityTestSupport.ReadRequiredAsync<MediaEnvelope>(uploadResponse);

        var updateCompanyResponse = await adminClient.PutAsJsonAsync("/company", new
        {
            displayName = "Acme Commerce",
            legalName = "Acme Commerce Private Limited",
            billingName = "Acme Commerce Billing",
            companyCode = "ACME",
            email = "hello@acme.local",
            phone = "+91 99999 99999",
            website = "https://acme.local",
            supportEmail = "support@acme.local",
            gstNumber = "GST123",
            panNumber = "PAN123",
            logoMediaId = media.Id,
            faviconMediaId = media.Id,
            currencyId = 2,
            timezone = "Asia/Calcutta",
            address = new
            {
                addressLine1 = "42 Platform Road",
                addressLine2 = "Suite 5",
                countryId = 1,
                stateId = 1,
                cityId = 1,
                pincodeId = 1,
                isPrimary = true
            }
        });
        updateCompanyResponse.EnsureSuccessStatusCode();

        var updateSettingsResponse = await adminClient.PutAsJsonAsync("/company/settings", new
        {
            settings = new[]
            {
                new { settingKey = "order_prefix", settingValue = "ORD", settingGroup = "Documents" },
                new { settingKey = "invoice_prefix", settingValue = "INVX", settingGroup = "Documents" }
            }
        });
        updateSettingsResponse.EnsureSuccessStatusCode();

        var publicCompanyResponse = await publicClient.GetAsync("/company");
        publicCompanyResponse.EnsureSuccessStatusCode();
        var company = await AuthSecurityTestSupport.ReadRequiredAsync<CompanyEnvelope>(publicCompanyResponse);

        Assert.Equal("Acme Commerce", company.DisplayName);
        Assert.Equal(media.Id, company.LogoMediaId);
        Assert.Equal("ORD", company.Settings.Single(x => x.SettingKey == "order_prefix").SettingValue);
        Assert.Equal("INVX", company.Settings.Single(x => x.SettingKey == "invoice_prefix").SettingValue);
        Assert.Equal("42 Platform Road", company.Address?.AddressLine1);

        var logs = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.AuditLogs
                .Where(x => x.Action.StartsWith("Company."))
                .Select(x => x.Action)
                .ToListAsync());

        Assert.Contains("Company.ProfileUpdated", logs);
        Assert.Contains("Company.AddressUpdated", logs);
        Assert.Contains("Company.SettingUpdated", logs);
    }

    private static HttpClient CreateAdminClient(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        var client = AuthSecurityTestSupport.CreateClient(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["User.Read"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }

    private sealed class MediaEnvelope
    {
        public int Id { get; set; }
    }

    private sealed class CompanyAddressEnvelope
    {
        public string AddressLine1 { get; set; } = string.Empty;
    }

    private sealed class CompanySettingEnvelope
    {
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
    }

    private sealed class CompanyEnvelope
    {
        public string DisplayName { get; set; } = string.Empty;
        public int? LogoMediaId { get; set; }
        public CompanyAddressEnvelope? Address { get; set; }
        public List<CompanySettingEnvelope> Settings { get; set; } = [];
    }
}

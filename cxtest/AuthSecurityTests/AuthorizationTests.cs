using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace cxtest.AuthSecurityTests;

public sealed class AuthorizationTests
{
    [Fact]
    public async Task Protected_endpoint_without_token_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Protected_endpoint_with_invalid_token_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        AuthSecurityTestSupport.SetBearerToken(client, "not-a-real-jwt");

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Correct_role_is_allowed_and_incorrect_role_is_forbidden()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var customerRequest = AuthSecurityTestSupport.CreateRegisterRequest("customerrole");
        var customerTokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, customerRequest);

        AuthSecurityTestSupport.SetBearerToken(client, customerTokens.AccessToken);
        var customerAdminResponse = await client.GetAsync("/auth/access/admin");
        Assert.Equal(HttpStatusCode.Forbidden, customerAdminResponse.StatusCode);

        client.DefaultRequestHeaders.Authorization = null;
        var adminTokens = await AuthSecurityTestSupport.LoginAndReadTokensAsync(client, "sundar@sundar.com", "kalarani");
        AuthSecurityTestSupport.SetBearerToken(client, adminTokens.AccessToken);

        var adminResponse = await client.GetAsync("/auth/access/admin");
        Assert.Equal(HttpStatusCode.OK, adminResponse.StatusCode);
    }

    [Fact]
    public async Task Access_token_cannot_impersonate_another_user()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var firstUser = AuthSecurityTestSupport.CreateRegisterRequest("impersonationa");
        var secondUser = AuthSecurityTestSupport.CreateRegisterRequest("impersonationb");

        var firstTokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, firstUser);
        client.DefaultRequestHeaders.Authorization = null;
        await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, secondUser);

        AuthSecurityTestSupport.SetBearerToken(client, firstTokens.AccessToken);
        var meResponse = await client.GetAsync("/auth/me");
        meResponse.EnsureSuccessStatusCode();

        var mePayload = await JsonSerializer.DeserializeAsync<JsonElement>(await meResponse.Content.ReadAsStreamAsync());
        Assert.Equal(firstUser.Email, mePayload.GetProperty("email").GetString());
        Assert.NotEqual(secondUser.Email, mePayload.GetProperty("email").GetString());
    }
}

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace cxtest;

public sealed class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(_ => { });
    }

    [Fact]
    public async Task User_registration_returns_tokens()
    {
        using var client = CreateClient();
        var request = CreateRegisterRequest();

        var response = await client.PostAsJsonAsync("/auth/register", request);
        response.EnsureSuccessStatusCode();

        var tokenResponse = await response.Content.ReadFromJsonAsync<TokenEnvelope>();

        Assert.NotNull(tokenResponse);
        Assert.False(string.IsNullOrWhiteSpace(tokenResponse.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(tokenResponse.RefreshToken));
        Assert.True(tokenResponse.ExpiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Login_success_returns_valid_jwt_and_allows_authenticated_requests()
    {
        using var client = CreateClient();
        var request = CreateRegisterRequest();

        await client.PostAsJsonAsync("/auth/register", request);

        var loginResponse = await client.PostAsJsonAsync("/auth/login", new
        {
            UsernameOrEmail = request.Email,
            request.Password
        });

        loginResponse.EnsureSuccessStatusCode();

        var tokenResponse = await loginResponse.Content.ReadFromJsonAsync<TokenEnvelope>();
        Assert.NotNull(tokenResponse);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokenResponse.AccessToken);

        var meResponse = await client.GetAsync("/auth/me");
        meResponse.EnsureSuccessStatusCode();

        var mePayload = await JsonSerializer.DeserializeAsync<JsonElement>(
            await meResponse.Content.ReadAsStreamAsync());

        Assert.Equal(request.Username, mePayload.GetProperty("username").GetString());

        var customerAccessResponse = await client.GetAsync("/auth/access/customer");
        customerAccessResponse.EnsureSuccessStatusCode();

        var adminAccessResponse = await client.GetAsync("/auth/access/admin");
        Assert.Equal(HttpStatusCode.Forbidden, adminAccessResponse.StatusCode);
    }

    [Fact]
    public async Task Refresh_token_rotation_revokes_old_token_and_returns_new_tokens()
    {
        using var client = CreateClient();
        var request = CreateRegisterRequest();

        var registerResponse = await client.PostAsJsonAsync("/auth/register", request);
        registerResponse.EnsureSuccessStatusCode();

        var initialTokens = await registerResponse.Content.ReadFromJsonAsync<TokenEnvelope>();
        Assert.NotNull(initialTokens);

        var refreshResponse = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = initialTokens.RefreshToken
        });

        refreshResponse.EnsureSuccessStatusCode();

        var rotatedTokens = await refreshResponse.Content.ReadFromJsonAsync<TokenEnvelope>();
        Assert.NotNull(rotatedTokens);
        Assert.NotEqual(initialTokens.RefreshToken, rotatedTokens.RefreshToken);
        Assert.NotEqual(initialTokens.AccessToken, rotatedTokens.AccessToken);

        var reusedRefreshResponse = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = initialTokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, reusedRefreshResponse.StatusCode);
    }

    [Fact]
    public async Task Login_endpoint_accepts_username_and_returns_tokens()
    {
        using var client = CreateClient();
        var request = CreateRegisterRequest();

        await client.PostAsJsonAsync("/auth/register", request);

        var loginResponse = await client.PostAsJsonAsync("/auth/login", new
        {
            UsernameOrEmail = request.Username,
            request.Password
        });

        loginResponse.EnsureSuccessStatusCode();
        var tokenResponse = await loginResponse.Content.ReadFromJsonAsync<TokenEnvelope>();

        Assert.NotNull(tokenResponse);
        Assert.False(string.IsNullOrWhiteSpace(tokenResponse.AccessToken));
    }

    private HttpClient CreateClient() => _factory.CreateClient();

    private static RegisterEnvelope CreateRegisterRequest()
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        return new RegisterEnvelope(
            $"user_{suffix}",
            $"user_{suffix}@example.com",
            "Password1");
    }

    private sealed record RegisterEnvelope(string Username, string Email, string Password);

    private sealed class TokenEnvelope
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTimeOffset ExpiresAt { get; set; }
    }
}

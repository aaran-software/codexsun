using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace cxtest.AuthSecurityTests;

public sealed class RefreshTokenTests
{
    [Fact]
    public async Task Refresh_rotation_revokes_the_previous_token_in_storage()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("refreshdb");

        var initialTokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var refreshResponse = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = initialTokens.RefreshToken
        });
        refreshResponse.EnsureSuccessStatusCode();

        var rotatedTokens = await AuthSecurityTestSupport.ReadRequiredAsync<AuthSecurityTestSupport.TokenEnvelope>(refreshResponse);
        var tokenState = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var original = await dbContext.RefreshTokens.SingleAsync(x => x.Token == initialTokens.RefreshToken);
            var rotated = await dbContext.RefreshTokens.SingleAsync(x => x.Token == rotatedTokens.RefreshToken);
            return new { original.RevokedAt, RotatedIsActive = rotated.IsActive };
        });

        Assert.NotNull(tokenState.RevokedAt);
        Assert.True(tokenState.RotatedIsActive);
    }

    [Fact]
    public async Task Revoked_refresh_token_cannot_be_reused()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("refreshreuse");

        var initialTokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var firstRefresh = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = initialTokens.RefreshToken
        });
        firstRefresh.EnsureSuccessStatusCode();

        var reuseResponse = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = initialTokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, reuseResponse.StatusCode);
    }

    [Fact]
    public async Task Expired_refresh_token_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("refreshexpired");

        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
        {
            var refreshToken = await dbContext.RefreshTokens.SingleAsync(x => x.Token == tokens.RefreshToken);
            refreshToken.ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-5);
            await dbContext.SaveChangesAsync();
        });

        var response = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = tokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_refresh_token_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var response = await client.PostAsJsonAsync("/auth/refresh", new
        {
            RefreshToken = Guid.NewGuid().ToString("N")
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

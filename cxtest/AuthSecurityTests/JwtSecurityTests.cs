using System.IdentityModel.Tokens.Jwt;
using System.Net;
using Microsoft.Extensions.Options;
using cxserver.Modules.Auth.Security;
using cxserver.Modules.Auth.Services;

namespace cxtest.AuthSecurityTests;

public sealed class JwtSecurityTests
{
    [Fact]
    public async Task Access_token_contains_required_claims()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("jwtclaims");

        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var jwt = AuthSecurityTestSupport.ReadJwt(tokens.AccessToken);

        Assert.Contains(jwt.Claims, claim => claim.Type == "UserId");
        Assert.Contains(jwt.Claims, claim => claim.Type == "Username");
        Assert.Contains(jwt.Claims, claim => claim.Type == "Role");
        Assert.Contains(jwt.Claims, claim => claim.Type == "Permissions");
    }

    [Fact]
    public async Task Valid_jwt_signature_is_accepted()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("jwtvalid");

        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var tokenService = AuthSecurityTestSupport.GetRequiredService<JwtTokenService>(factory);

        var principal = tokenService.ValidateToken(tokens.AccessToken);

        Assert.NotNull(principal);
        Assert.Equal(request.Username, principal.Identity?.Name);
    }

    [Fact]
    public async Task Expired_jwt_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var expiredToken = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.NewGuid(),
            "expired-user",
            "Customer",
            ["User.Read"],
            DateTimeOffset.UtcNow.AddMinutes(-5));

        AuthSecurityTestSupport.SetBearerToken(client, expiredToken);

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Tampered_jwt_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("jwttamper");

        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var tamperedToken = tokens.AccessToken[..^1] + (tokens.AccessToken[^1] == 'a' ? 'b' : 'a');

        AuthSecurityTestSupport.SetBearerToken(client, tamperedToken);

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_token_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        AuthSecurityTestSupport.SetBearerToken(client, "invalid.token.value");

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

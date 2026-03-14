using System.Net;

namespace cxtest.AuthSecurityTests;

public sealed class RateLimitTests
{
    [Fact]
    public async Task Anonymous_requests_exceeding_limit_return_429()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory(new Dictionary<string, string?>
        {
            ["RateLimiting:PerIp:PermitLimit"] = "3",
            ["RateLimiting:PerIp:WindowSeconds"] = "60"
        });
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        HttpStatusCode? status = null;
        for (var i = 0; i < 6; i++)
        {
            var response = await client.GetAsync("/auth/me");
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                status = response.StatusCode;
                break;
            }
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, status);
    }

    [Fact]
    public async Task Authenticated_requests_exceeding_limit_return_429()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory(new Dictionary<string, string?>
        {
            ["RateLimiting:PerUser:PermitLimit"] = "3",
            ["RateLimiting:PerUser:WindowSeconds"] = "60"
        });
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        var request = AuthSecurityTestSupport.CreateRegisterRequest("peruserlimit");
        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        AuthSecurityTestSupport.SetBearerToken(client, tokens.AccessToken);

        HttpStatusCode? status = null;
        for (var i = 0; i < 8; i++)
        {
            var response = await client.GetAsync("/auth/me");
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                status = response.StatusCode;
                break;
            }
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, status);
    }
}

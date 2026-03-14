using System.Net;
using System.Net.Http.Json;

namespace cxtest.AuthSecurityTests;

public sealed class LoginAttackTests
{
    [Fact]
    public async Task Sql_injection_login_attempt_is_rejected()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var response = await client.PostAsJsonAsync("/auth/login", new
        {
            UsernameOrEmail = "' OR 1=1 --",
            Password = "Password1"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Xss_payload_is_rejected_by_registration_validation()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        var response = await client.PostAsJsonAsync("/auth/register", new
        {
            Username = "<script>alert(1)</script>",
            Email = "xss@example.com",
            Password = "Password1"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Repeated_login_failures_trigger_rate_limiting()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory(new Dictionary<string, string?>
        {
            ["RateLimiting:PerIp:PermitLimit"] = "5",
            ["RateLimiting:PerIp:WindowSeconds"] = "60"
        });
        using var client = AuthSecurityTestSupport.CreateClient(factory);

        HttpStatusCode? throttledStatus = null;
        for (var i = 0; i < 8; i++)
        {
            var response = await client.PostAsJsonAsync("/auth/login", new
            {
                UsernameOrEmail = $"attacker{i}@example.com",
                Password = "Password1"
            });

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throttledStatus = response.StatusCode;
                break;
            }
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, throttledStatus);
    }
}

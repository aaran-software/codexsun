using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace cxtest.AuthSecurityTests;

public sealed class AuditLogTests
{
    [Fact]
    public async Task Successful_login_is_audited_with_user_ip_and_timestamp()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.10");
        var request = AuthSecurityTestSupport.CreateRegisterRequest("auditlogin");

        await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        var startedAt = DateTimeOffset.UtcNow.AddSeconds(-1);
        await AuthSecurityTestSupport.LoginAndReadTokensAsync(client, request.Email, request.Password);

        var log = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.AuditLogs
                .Where(x => x.Action == "Auth.Login" && x.CreatedAt >= startedAt)
                .OrderByDescending(x => x.CreatedAt)
                .FirstAsync());

        Assert.NotNull(log.UserId);
        Assert.Equal("203.0.113.10", log.IpAddress);
        Assert.True(log.CreatedAt >= startedAt);
    }

    [Fact]
    public async Task Failed_login_is_audited()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.11");
        var startedAt = DateTimeOffset.UtcNow.AddSeconds(-1);

        var response = await client.PostAsJsonAsync("/auth/login", new
        {
            UsernameOrEmail = "nobody@example.com",
            Password = "Password1"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var log = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.AuditLogs
                .Where(x => x.Action == "Auth.LoginFailed" && x.CreatedAt >= startedAt)
                .OrderByDescending(x => x.CreatedAt)
                .FirstAsync());

        Assert.Null(log.UserId);
        Assert.Equal("203.0.113.11", log.IpAddress);
        Assert.True(log.CreatedAt >= startedAt);
    }

    [Fact]
    public async Task Logout_is_audited()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.12");
        var request = AuthSecurityTestSupport.CreateRegisterRequest("auditlogout");
        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(client, request);
        AuthSecurityTestSupport.SetBearerToken(client, tokens.AccessToken);
        var startedAt = DateTimeOffset.UtcNow.AddSeconds(-1);

        var response = await client.PostAsJsonAsync("/auth/logout", new
        {
            RefreshToken = tokens.RefreshToken
        });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var log = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.AuditLogs
                .Where(x => x.Action == "Auth.Logout" && x.CreatedAt >= startedAt)
                .OrderByDescending(x => x.CreatedAt)
                .FirstAsync());

        Assert.NotNull(log.UserId);
        Assert.Equal("203.0.113.12", log.IpAddress);
    }

    [Fact]
    public async Task Admin_actions_are_audited()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = AuthSecurityTestSupport.CreateClient(factory);
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.13");
        var adminTokens = await AuthSecurityTestSupport.LoginAndReadTokensAsync(client, "sundar@sundar.com", "kalarani");
        AuthSecurityTestSupport.SetBearerToken(client, adminTokens.AccessToken);
        var startedAt = DateTimeOffset.UtcNow.AddSeconds(-1);

        var response = await client.PostAsJsonAsync("/auth/roles", new
        {
            Name = $"AuditedRole_{Guid.NewGuid():N}"[..20],
            Description = "Role created by security test"
        });

        response.EnsureSuccessStatusCode();

        var log = await AuthSecurityTestSupport.WithDbContextAsync(factory, dbContext =>
            dbContext.AuditLogs
                .Where(x => x.Action == "Auth.RoleCreate" && x.CreatedAt >= startedAt)
                .OrderByDescending(x => x.CreatedAt)
                .FirstAsync());

        Assert.NotNull(log.UserId);
        Assert.Equal("203.0.113.13", log.IpAddress);
    }
}

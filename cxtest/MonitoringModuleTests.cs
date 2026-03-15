using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using cxtest.AuthSecurityTests;
using cxserver.Modules.Auth.Security;
using cxserver.Modules.Monitoring.Services;

namespace cxtest;

public sealed class MonitoringModuleTests
{
    [Fact]
    public async Task Monitoring_module_tracks_audit_logs_login_history_system_logs_and_errors()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var publicClient = AuthSecurityTestSupport.CreateClient(factory);
        using var adminClient = CreateAdminClient(factory);

        publicClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0");
        publicClient.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.10");

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var failedLogin = await publicClient.PostAsJsonAsync("/auth/login", new
            {
                UsernameOrEmail = "missing@example.com",
                Password = "Password1"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, failedLogin.StatusCode);
        }

        var registerRequest = AuthSecurityTestSupport.CreateRegisterRequest("monitoring");
        var tokens = await AuthSecurityTestSupport.RegisterAndReadTokensAsync(publicClient, registerRequest);

        var loginTokens = await AuthSecurityTestSupport.LoginAndReadTokensAsync(publicClient, registerRequest.Email, registerRequest.Password);
        AuthSecurityTestSupport.SetBearerToken(publicClient, loginTokens.AccessToken);

        var logoutResponse = await publicClient.PostAsJsonAsync("/auth/logout", new
        {
            RefreshToken = loginTokens.RefreshToken
        });
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);

        var updateSettingsResponse = await adminClient.PutAsJsonAsync("/company/settings", new
        {
            settings = new[]
            {
                new { settingKey = "date_format", settingValue = "dd/MM/yyyy", settingGroup = "System" }
            }
        });
        updateSettingsResponse.EnsureSuccessStatusCode();

        var roles = await AuthSecurityTestSupport.ReadRequiredAsync<List<RoleEnvelope>>(await adminClient.GetAsync("/auth/roles"));
        var permissions = await AuthSecurityTestSupport.ReadRequiredAsync<List<PermissionEnvelope>>(await adminClient.GetAsync("/auth/permissions"));
        var rolePermissions = await AuthSecurityTestSupport.ReadRequiredAsync<List<Guid>>(await adminClient.GetAsync($"/auth/roles/{roles[0].Id}/permissions"));

        var permissionUpdateResponse = await adminClient.PutAsJsonAsync($"/auth/roles/{roles[0].Id}/permissions", new
        {
            permissionIds = rolePermissions.Count > 0
                ? rolePermissions
                : permissions.Take(1).Select(x => x.Id).ToList()
        });
        Assert.Equal(HttpStatusCode.NoContent, permissionUpdateResponse.StatusCode);

        using (var scope = factory.Services.CreateScope())
        {
            var errorLogService = scope.ServiceProvider.GetRequiredService<IErrorLogService>();
            await errorLogService.LogAsync(
                "MonitoringTests",
                new InvalidOperationException("Synthetic monitoring failure."),
                "/test/monitoring/error",
                null,
                "203.0.113.10",
                CancellationToken.None);
        }

        var auditLogs = await AuthSecurityTestSupport.ReadRequiredAsync<List<AuditLogEnvelope>>(
            await adminClient.GetAsync("/api/admin/monitoring/audit-logs?module=Company"));
        var systemLogs = await AuthSecurityTestSupport.ReadRequiredAsync<List<SystemLogEnvelope>>(
            await adminClient.GetAsync("/api/admin/monitoring/system-logs"));
        var errorLogs = await AuthSecurityTestSupport.ReadRequiredAsync<List<ErrorLogEnvelope>>(
            await adminClient.GetAsync("/api/admin/monitoring/error-logs"));
        var loginHistory = await AuthSecurityTestSupport.ReadRequiredAsync<List<LoginHistoryEnvelope>>(
            await adminClient.GetAsync("/api/admin/monitoring/login-history?ip=203.0.113.10"));

        Assert.Contains(auditLogs, log => log.Action.Contains("Company.SettingUpdated", StringComparison.OrdinalIgnoreCase)
                                          || log.Action.Contains("PUT /company/settings", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(systemLogs, log => log.EventType == "SuspiciousIpActivity");
        Assert.Contains(systemLogs, log => log.EventType == "AdminPermissionChange");
        Assert.Contains(errorLogs, log => log.Path.Contains("/test/monitoring/error", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(loginHistory, item => item.LoginStatus == "Failed");
        Assert.Contains(loginHistory, item => item.LoginStatus == "Success");
        Assert.Contains(loginHistory, item => item.LogoutTime is not null);
    }

    private static HttpClient CreateAdminClient(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        var client = AuthSecurityTestSupport.CreateClient(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("66666666-6666-6666-6666-666666666666"),
            "monitor-admin",
            "Admin",
            ["User.Read"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }

    private sealed class RoleEnvelope
    {
        public Guid Id { get; set; }
    }

    private sealed class PermissionEnvelope
    {
        public Guid Id { get; set; }
    }

    private sealed class AuditLogEnvelope
    {
        public string Action { get; set; } = string.Empty;
    }

    private sealed class SystemLogEnvelope
    {
        public string EventType { get; set; } = string.Empty;
    }

    private sealed class ErrorLogEnvelope
    {
        public string Path { get; set; } = string.Empty;
    }

    private sealed class LoginHistoryEnvelope
    {
        public string LoginStatus { get; set; } = string.Empty;
        public DateTimeOffset? LogoutTime { get; set; }
    }
}

using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;

namespace cxtest;

public sealed class NotificationsModuleTests
{
    [Fact]
    public async Task User_registration_queues_and_processes_notifications()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var publicClient = AuthSecurityTestSupport.CreateClient(factory);
        using var adminClient = CreateAdminClient(factory);
        var registerRequest = AuthSecurityTestSupport.CreateRegisterRequest("notify");

        var registerResponse = await publicClient.PostAsJsonAsync("/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        var registeredUserId = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Users
                .Where(x => x.Email == registerRequest.Email.ToLower())
                .Select(x => x.Id)
                .SingleAsync());

        var pendingCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Notifications.CountAsync(x => x.UserId == registeredUserId && x.Status == "Pending"));

        Assert.True(pendingCount >= 1);

        var processResponse = await adminClient.PostAsync("/notifications/settings/process", content: null);
        processResponse.EnsureSuccessStatusCode();

        var sentCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.Notifications.CountAsync(x => x.UserId == registeredUserId && x.Status == "Sent"));

        var logsCount = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.NotificationLogs
                .Include(x => x.Notification)
                .CountAsync(x => x.Notification.UserId == registeredUserId && x.Status == "Sent"));

        Assert.True(sentCount >= 1);
        Assert.True(logsCount >= 1);
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
            ["User.Read", "inventory.view", "vendors.view"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }
}

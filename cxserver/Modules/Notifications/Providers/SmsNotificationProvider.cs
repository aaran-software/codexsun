using Microsoft.Extensions.Logging;
using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Providers;

public sealed class SmsNotificationProvider(ILogger<SmsNotificationProvider> logger) : INotificationProvider
{
    public string Channel => "SMS";

    public Task<string> SendAsync(Notification notification, string subject, string body, CancellationToken cancellationToken)
    {
        logger.LogInformation("Simulated SMS send for notification {NotificationId} to user {UserId}", notification.Id, notification.UserId);
        return Task.FromResult($"SMS accepted: chars={body.Length}");
    }
}

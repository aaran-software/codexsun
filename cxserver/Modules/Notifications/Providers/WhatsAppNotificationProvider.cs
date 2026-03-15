using Microsoft.Extensions.Logging;
using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Providers;

public sealed class WhatsAppNotificationProvider(ILogger<WhatsAppNotificationProvider> logger) : INotificationProvider
{
    public string Channel => "WhatsApp";

    public Task<string> SendAsync(Notification notification, string subject, string body, CancellationToken cancellationToken)
    {
        logger.LogInformation("Simulated WhatsApp send for notification {NotificationId} to user {UserId}", notification.Id, notification.UserId);
        return Task.FromResult($"WhatsApp accepted: chars={body.Length}");
    }
}

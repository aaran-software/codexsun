using Microsoft.Extensions.Logging;
using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Providers;

public sealed class EmailNotificationProvider(ILogger<EmailNotificationProvider> logger) : INotificationProvider
{
    public string Channel => "Email";

    public Task<string> SendAsync(Notification notification, string subject, string body, CancellationToken cancellationToken)
    {
        logger.LogInformation("Simulated email send for notification {NotificationId} to user {UserId}", notification.Id, notification.UserId);
        return Task.FromResult($"Email accepted: subject='{subject}', bytes={body.Length}");
    }
}

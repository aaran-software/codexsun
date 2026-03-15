using cxserver.Modules.Notifications.Entities;

namespace cxserver.Modules.Notifications.Providers;

public interface INotificationProvider
{
    string Channel { get; }
    Task<string> SendAsync(Notification notification, string subject, string body, CancellationToken cancellationToken);
}

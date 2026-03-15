using cxserver.Modules.Auth.Entities;

namespace cxserver.Modules.Notifications.Entities;

public abstract class NotificationEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class NotificationTemplate : NotificationEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string TemplateBody { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<Notification> Notifications { get; set; } = [];
}

public sealed class Notification : NotificationEntity
{
    public int TemplateId { get; set; }
    public NotificationTemplate Template { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Channel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public DateTimeOffset? SentAt { get; set; }
    public ICollection<NotificationLog> Logs { get; set; } = [];
}

public sealed class NotificationLog : NotificationEntity
{
    public int NotificationId { get; set; }
    public Notification Notification { get; set; } = null!;
    public string ProviderResponse { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

namespace cxserver.Modules.Notifications.DTOs;

public sealed class NotificationTemplateUpsertRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string TemplateBody { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class QueueNotificationRequest
{
    public string TemplateCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Dictionary<string, string> Payload { get; set; } = [];
}

public sealed class NotificationSettingsUpdateRequest
{
    public bool EmailEnabled { get; set; } = true;
    public bool SmsEnabled { get; set; } = true;
    public bool WhatsAppEnabled { get; set; } = true;
    public bool InAppEnabled { get; set; } = true;
    public int BatchSize { get; set; } = 25;
}

namespace cxserver.Modules.Notifications.DTOs;

public sealed class NotificationTemplateResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string TemplateBody { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class NotificationLogResponse
{
    public int Id { get; set; }
    public int NotificationId { get; set; }
    public string TemplateCode { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ProviderResponse { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class NotificationSettingsResponse
{
    public bool EmailEnabled { get; set; }
    public bool SmsEnabled { get; set; }
    public bool WhatsAppEnabled { get; set; }
    public bool InAppEnabled { get; set; }
    public int BatchSize { get; set; }
    public int PendingCount { get; set; }
    public int SentCount { get; set; }
    public int FailedCount { get; set; }
    public string[] SupportedChannels { get; set; } = [];
    public string[] RegisteredProviders { get; set; } = [];
}

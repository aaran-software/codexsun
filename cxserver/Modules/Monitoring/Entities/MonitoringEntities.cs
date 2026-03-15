using cxserver.Modules.Auth.Entities;

namespace cxserver.Modules.Monitoring.Entities;

public abstract class MonitoringEntity
{
    public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class SystemLog : MonitoringEntity
{
    public string Service { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
}

public sealed class ErrorLog : MonitoringEntity
{
    public string Service { get; set; } = string.Empty;
    public string ExceptionMessage { get; set; } = string.Empty;
    public string StackTrace { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string IpAddress { get; set; } = string.Empty;
}

public sealed class LoginHistory : MonitoringEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string Email { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Device { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string OS { get; set; } = string.Empty;
    public string LoginStatus { get; set; } = string.Empty;
    public DateTimeOffset LoginTime { get; set; }
    public DateTimeOffset? LogoutTime { get; set; }
}

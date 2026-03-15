using cxserver.Modules.Monitoring.DTOs;

namespace cxserver.Modules.Monitoring.Services;

public interface IAuditLogService
{
    Task LogAsync(Guid? userId, string action, string entityType, string? entityId, string module, string? oldValues, string? newValues, CancellationToken cancellationToken);
    Task<IReadOnlyList<AuditLogResponse>> GetAuditLogsAsync(Guid? userId, string? module, string? action, DateOnly? date, CancellationToken cancellationToken);
}

public interface ISystemLogService
{
    Task LogAsync(string service, string eventType, string message, string severity, string? details, CancellationToken cancellationToken);
    Task<IReadOnlyList<SystemLogResponse>> GetSystemLogsAsync(string? service, string? severity, DateOnly? date, CancellationToken cancellationToken);
}

public interface IErrorLogService
{
    Task LogAsync(string service, Exception exception, string path, Guid? userId, string ipAddress, CancellationToken cancellationToken);
    Task<IReadOnlyList<ErrorLogResponse>> GetErrorLogsAsync(string? service, Guid? userId, DateOnly? date, CancellationToken cancellationToken);
}

public interface ILoginHistoryService
{
    Task RecordSuccessfulLoginAsync(Guid userId, string email, CancellationToken cancellationToken);
    Task RecordFailedLoginAsync(Guid? userId, string email, string status, CancellationToken cancellationToken);
    Task RecordLogoutAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<LoginHistoryResponse>> GetLoginHistoryAsync(Guid? userId, string? status, string? ipAddress, DateOnly? date, CancellationToken cancellationToken);
}

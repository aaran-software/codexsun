using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Monitoring.DTOs;
using cxserver.Modules.Monitoring.Entities;

namespace cxserver.Modules.Monitoring.Services;

public sealed class AuditLogService(
    CodexsunDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ISystemLogService systemLogService) : IAuditLogService
{
    public async Task LogAsync(
        Guid? userId,
        string action,
        string entityType,
        string? entityId,
        string module,
        string? oldValues,
        string? newValues,
        CancellationToken cancellationToken)
    {
        var context = httpContextAccessor.HttpContext;
        var ipAddress = GetIpAddress(context);
        var userAgent = context?.Request.Headers.UserAgent.ToString() ?? string.Empty;

        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Module = string.IsNullOrWhiteSpace(module) ? InferModule(context?.Request.Path.Value) : module,
            OldValues = oldValues ?? string.Empty,
            NewValues = newValues ?? string.Empty,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await TrackSecuritySignalsAsync(action, entityType, module, cancellationToken);
    }

    public async Task<IReadOnlyList<AuditLogResponse>> GetAuditLogsAsync(Guid? userId, string? module, string? action, DateOnly? date, CancellationToken cancellationToken)
    {
        var query = dbContext.AuditLogs
            .AsNoTracking()
            .Include(x => x.User)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(module))
        {
            query = query.Where(x => x.Module == module.Trim());
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            var normalized = action.Trim().ToLowerInvariant();
            query = query.Where(x => x.Action.ToLower().Contains(normalized));
        }

        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(x => x.CreatedAt >= start && x.CreatedAt < end);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .Select(x => new AuditLogResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                Username = x.User != null ? x.User.Username : string.Empty,
                Email = x.User != null ? x.User.Email : string.Empty,
                Action = x.Action,
                EntityType = x.EntityType,
                EntityId = x.EntityId ?? string.Empty,
                Module = x.Module,
                OldValues = x.OldValues,
                NewValues = x.NewValues,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private async Task TrackSecuritySignalsAsync(string action, string entityType, string module, CancellationToken cancellationToken)
    {
        if (!action.Equals("Product.Delete", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var since = DateTimeOffset.UtcNow.AddMinutes(-10);
        var deletes = await dbContext.AuditLogs.CountAsync(
            x => x.Action == "Product.Delete"
                && x.CreatedAt >= since,
            cancellationToken);

        if (deletes >= 5)
        {
            await systemLogService.LogAsync(
                "Monitoring",
                "MassProductDeletion",
                "Mass product deletion activity detected.",
                "Critical",
                $"Detected {deletes} product deletions in the last 10 minutes.",
                cancellationToken);
        }
    }

    private static string GetIpAddress(HttpContext? context)
    {
        if (context is null)
        {
            return "unknown";
        }

        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) &&
            !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static string InferModule(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return "System";
        }

        var segments = path.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0)
        {
            return "System";
        }

        return segments[0].Equals("api", StringComparison.OrdinalIgnoreCase) && segments.Length > 2
            ? segments[2]
            : segments[0];
    }
}

public sealed class SystemLogService(CodexsunDbContext dbContext) : ISystemLogService
{
    private static readonly HashSet<string> AllowedSeverity = ["Info", "Warning", "Critical", "Debug"];

    public async Task LogAsync(string service, string eventType, string message, string severity, string? details, CancellationToken cancellationToken)
    {
        var normalizedSeverity = AllowedSeverity.Contains(severity) ? severity : "Info";

        dbContext.SystemLogs.Add(new SystemLog
        {
            Id = Guid.NewGuid(),
            Service = service.Trim(),
            EventType = eventType.Trim(),
            Message = message.Trim(),
            Details = details?.Trim() ?? string.Empty,
            Severity = normalizedSeverity,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SystemLogResponse>> GetSystemLogsAsync(string? service, string? severity, DateOnly? date, CancellationToken cancellationToken)
    {
        var query = dbContext.SystemLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(service))
        {
            var normalized = service.Trim().ToLowerInvariant();
            query = query.Where(x => x.Service.ToLower().Contains(normalized));
        }

        if (!string.IsNullOrWhiteSpace(severity))
        {
            query = query.Where(x => x.Severity == severity.Trim());
        }

        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(x => x.CreatedAt >= start && x.CreatedAt < end);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .Select(x => new SystemLogResponse
            {
                Id = x.Id,
                Service = x.Service,
                EventType = x.EventType,
                Message = x.Message,
                Details = x.Details,
                Severity = x.Severity,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

public sealed class ErrorLogService(CodexsunDbContext dbContext) : IErrorLogService
{
    public async Task LogAsync(string service, Exception exception, string path, Guid? userId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.ErrorLogs.Add(new ErrorLog
        {
            Id = Guid.NewGuid(),
            Service = service,
            ExceptionMessage = exception.Message,
            StackTrace = exception.StackTrace ?? string.Empty,
            Source = exception.Source ?? string.Empty,
            Path = path,
            UserId = userId,
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ErrorLogResponse>> GetErrorLogsAsync(string? service, Guid? userId, DateOnly? date, CancellationToken cancellationToken)
    {
        var query = dbContext.ErrorLogs
            .AsNoTracking()
            .Include(x => x.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(service))
        {
            var normalized = service.Trim().ToLowerInvariant();
            query = query.Where(x => x.Service.ToLower().Contains(normalized));
        }

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(x => x.CreatedAt >= start && x.CreatedAt < end);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .Select(x => new ErrorLogResponse
            {
                Id = x.Id,
                Service = x.Service,
                ExceptionMessage = x.ExceptionMessage,
                StackTrace = x.StackTrace,
                Source = x.Source,
                Path = x.Path,
                UserId = x.UserId,
                Username = x.User != null ? x.User.Username : string.Empty,
                Email = x.User != null ? x.User.Email : string.Empty,
                IpAddress = x.IpAddress,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

public sealed class LoginHistoryService(
    CodexsunDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ISystemLogService systemLogService) : ILoginHistoryService
{
    public async Task RecordSuccessfulLoginAsync(Guid userId, string email, CancellationToken cancellationToken)
    {
        dbContext.LoginHistory.Add(new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Email = email,
            IpAddress = GetIpAddress(httpContextAccessor.HttpContext),
            Device = GetDevice(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            Browser = GetBrowser(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            OS = GetOs(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            LoginStatus = "Success",
            LoginTime = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RecordFailedLoginAsync(Guid? userId, string email, string status, CancellationToken cancellationToken)
    {
        dbContext.LoginHistory.Add(new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Email = email,
            IpAddress = GetIpAddress(httpContextAccessor.HttpContext),
            Device = GetDevice(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            Browser = GetBrowser(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            OS = GetOs(httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString()),
            LoginStatus = status,
            LoginTime = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        var ipAddress = GetIpAddress(httpContextAccessor.HttpContext);
        var windowStart = DateTimeOffset.UtcNow.AddMinutes(-15);
        var failures = await dbContext.LoginHistory.CountAsync(
            x => x.IpAddress == ipAddress
                && x.LoginTime >= windowStart
                && (x.LoginStatus == "Failed" || x.LoginStatus == "Blocked"),
            cancellationToken);

        if (failures >= 5)
        {
            await systemLogService.LogAsync(
                "Security",
                "SuspiciousIpActivity",
                "Multiple login failures detected from the same IP address.",
                "Warning",
                $"IP {ipAddress} produced {failures} failed or blocked login attempts in the last 15 minutes.",
                cancellationToken);
        }
    }

    public async Task RecordLogoutAsync(Guid userId, CancellationToken cancellationToken)
    {
        var latest = await dbContext.LoginHistory
            .Where(x => x.UserId == userId && x.LoginStatus == "Success" && x.LogoutTime == null)
            .OrderByDescending(x => x.LoginTime)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest is null)
        {
            return;
        }

        latest.LogoutTime = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LoginHistoryResponse>> GetLoginHistoryAsync(Guid? userId, string? status, string? ipAddress, DateOnly? date, CancellationToken cancellationToken)
    {
        var query = dbContext.LoginHistory
            .AsNoTracking()
            .Include(x => x.User)
            .AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.LoginStatus == status.Trim());
        }

        if (!string.IsNullOrWhiteSpace(ipAddress))
        {
            var normalized = ipAddress.Trim();
            query = query.Where(x => x.IpAddress.Contains(normalized));
        }

        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(x => x.LoginTime >= start && x.LoginTime < end);
        }

        return await query
            .OrderByDescending(x => x.LoginTime)
            .Take(500)
            .Select(x => new LoginHistoryResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                Username = x.User != null ? x.User.Username : string.Empty,
                Email = x.Email,
                IpAddress = x.IpAddress,
                Device = x.Device,
                Browser = x.Browser,
                Os = x.OS,
                LoginStatus = x.LoginStatus,
                LoginTime = x.LoginTime,
                LogoutTime = x.LogoutTime
            })
            .ToListAsync(cancellationToken);
    }

    private static string GetIpAddress(HttpContext? context)
    {
        if (context is null)
        {
            return "unknown";
        }

        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) &&
            !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static string GetDevice(string? userAgent)
        => string.IsNullOrWhiteSpace(userAgent)
            ? "Unknown"
            : userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase) ? "Mobile" : "Desktop";

    private static string GetBrowser(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return "Unknown";
        }

        if (userAgent.Contains("Edg", StringComparison.OrdinalIgnoreCase))
        {
            return "Edge";
        }

        if (userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase))
        {
            return "Chrome";
        }

        if (userAgent.Contains("Firefox", StringComparison.OrdinalIgnoreCase))
        {
            return "Firefox";
        }

        if (userAgent.Contains("Safari", StringComparison.OrdinalIgnoreCase))
        {
            return "Safari";
        }

        return "Unknown";
    }

    private static string GetOs(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return "Unknown";
        }

        if (userAgent.Contains("Windows", StringComparison.OrdinalIgnoreCase))
        {
            return "Windows";
        }

        if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase))
        {
            return "Android";
        }

        if (userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase) || userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase))
        {
            return "iOS";
        }

        if (userAgent.Contains("Mac OS", StringComparison.OrdinalIgnoreCase))
        {
            return "macOS";
        }

        if (userAgent.Contains("Linux", StringComparison.OrdinalIgnoreCase))
        {
            return "Linux";
        }

        return "Unknown";
    }
}

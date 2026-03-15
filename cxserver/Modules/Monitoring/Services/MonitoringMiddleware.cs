using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace cxserver.Modules.Monitoring.Services;

public sealed class ErrorLoggingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IErrorLogService errorLogService, ISystemLogService systemLogService)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var userId = TryGetUserId(context);
            var ipAddress = GetIpAddress(context);
            await errorLogService.LogAsync("API", exception, context.Request.Path, userId, ipAddress, context.RequestAborted);
            await systemLogService.LogAsync("API", "UnhandledException", exception.Message, "Critical", context.Request.Path, context.RequestAborted);

            if (!context.Response.HasStarted)
            {
                context.Response.Clear();
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";
                var payload = JsonSerializer.Serialize(new { message = "An unexpected error occurred." });
                await context.Response.WriteAsync(payload);
            }
        }
    }

    private static Guid? TryGetUserId(HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }

    private static string GetIpAddress(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) &&
            !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

public sealed class AuditMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> MethodsToAudit = ["POST", "PUT", "PATCH", "DELETE"];

    public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService)
    {
        if (!MethodsToAudit.Contains(context.Request.Method))
        {
            await next(context);
            return;
        }

        var requestBody = await ReadRequestBodyAsync(context);
        await next(context);

        if (context.Response.StatusCode >= 400)
        {
            return;
        }

        var userId = TryGetUserId(context);
        var path = context.Request.Path.Value ?? string.Empty;
        await auditLogService.LogAsync(
            userId,
            $"{context.Request.Method} {path}",
            GetEntityType(path),
            GetEntityId(path),
            InferModule(path),
            null,
            requestBody,
            context.RequestAborted);
    }

    private static async Task<string> ReadRequestBodyAsync(HttpContext context)
    {
        if (context.Request.ContentLength is null or 0)
        {
            return string.Empty;
        }

        context.Request.EnableBuffering();
        context.Request.Body.Position = 0;
        using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0;
        return body;
    }

    private static Guid? TryGetUserId(HttpContext context)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }

    private static string InferModule(string path)
    {
        var segments = path.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0)
        {
            return "System";
        }

        return segments[0].Equals("api", StringComparison.OrdinalIgnoreCase) && segments.Length > 2
            ? segments[2]
            : segments[0];
    }

    private static string GetEntityType(string path)
    {
        var segments = path.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0)
        {
            return "Request";
        }

        return segments[^1].All(char.IsDigit) && segments.Length > 1
            ? segments[^2]
            : segments[^1];
    }

    private static string? GetEntityId(string path)
    {
        var segments = path.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0)
        {
            return null;
        }

        var last = segments[^1];
        return Guid.TryParse(last, out _) || last.All(char.IsDigit) ? last : null;
    }
}

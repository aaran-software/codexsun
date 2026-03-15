using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Monitoring.DTOs;
using cxserver.Modules.Monitoring.Services;

namespace cxserver.Modules.Monitoring.Controllers;

[ApiController]
[Route("api/admin/monitoring")]
[Authorize(Policy = AuthorizationPolicies.AdminAccess)]
public sealed class MonitoringController(
    IAuditLogService auditLogService,
    ISystemLogService systemLogService,
    IErrorLogService errorLogService,
    ILoginHistoryService loginHistoryService) : ControllerBase
{
    [HttpGet("audit-logs")]
    public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>> GetAuditLogs(
        [FromQuery] Guid? user,
        [FromQuery] string? module,
        [FromQuery] string? action,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
        => Ok(await auditLogService.GetAuditLogsAsync(user, module, action, date, cancellationToken));

    [HttpGet("system-logs")]
    public async Task<ActionResult<IReadOnlyList<SystemLogResponse>>> GetSystemLogs(
        [FromQuery] string? service,
        [FromQuery] string? severity,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
        => Ok(await systemLogService.GetSystemLogsAsync(service, severity, date, cancellationToken));

    [HttpGet("error-logs")]
    public async Task<ActionResult<IReadOnlyList<ErrorLogResponse>>> GetErrorLogs(
        [FromQuery] string? service,
        [FromQuery] Guid? user,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
        => Ok(await errorLogService.GetErrorLogsAsync(service, user, date, cancellationToken));

    [HttpGet("login-history")]
    public async Task<ActionResult<IReadOnlyList<LoginHistoryResponse>>> GetLoginHistory(
        [FromQuery] Guid? user,
        [FromQuery] string? status,
        [FromQuery] string? ip,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
        => Ok(await loginHistoryService.GetLoginHistoryAsync(user, status, ip, date, cancellationToken));
}

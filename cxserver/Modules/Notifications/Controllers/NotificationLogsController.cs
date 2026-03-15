using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Notifications.DTOs;
using cxserver.Modules.Notifications.Services;

namespace cxserver.Modules.Notifications.Controllers;

[ApiController]
[Route("notifications/logs")]
[Authorize]
public sealed class NotificationLogsController(NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationLogResponse>>> GetLogs(CancellationToken cancellationToken)
        => Ok(await notificationService.GetLogsAsync(cancellationToken));
}

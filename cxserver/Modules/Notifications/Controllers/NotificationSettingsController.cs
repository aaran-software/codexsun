using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Notifications.DTOs;
using cxserver.Modules.Notifications.Services;

namespace cxserver.Modules.Notifications.Controllers;

[ApiController]
[Route("notifications/settings")]
[Authorize]
public sealed class NotificationSettingsController(NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<NotificationSettingsResponse>> GetSettings(CancellationToken cancellationToken)
        => Ok(await notificationService.GetSettingsAsync(cancellationToken));

    [HttpPut]
    public async Task<ActionResult<NotificationSettingsResponse>> UpdateSettings(NotificationSettingsUpdateRequest request, CancellationToken cancellationToken)
        => Ok(await notificationService.UpdateSettingsAsync(request, cancellationToken));

    [HttpPost("process")]
    public async Task<ActionResult<object>> ProcessQueue(CancellationToken cancellationToken)
        => Ok(new { processed = await notificationService.ProcessNotificationQueueAsync(cancellationToken) });
}

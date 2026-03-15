using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Notifications.DTOs;
using cxserver.Modules.Notifications.Services;

namespace cxserver.Modules.Notifications.Controllers;

[ApiController]
[Route("notifications/templates")]
[Authorize]
public sealed class NotificationTemplatesController(NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationTemplateResponse>>> GetTemplates(CancellationToken cancellationToken)
        => Ok(await notificationService.GetTemplatesAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateTemplate(NotificationTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await notificationService.CreateTemplateAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTemplate(int id, NotificationTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await notificationService.UpdateTemplateAsync(id, request, cancellationToken);
            return template is null ? NotFound() : Ok(template);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}

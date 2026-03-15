using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Media.DTOs;
using cxserver.Modules.Media.Services;

namespace cxserver.Modules.Media.Controllers;

[ApiController]
[Route("media/folders")]
[Authorize]
public sealed class FoldersController(MediaService mediaService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MediaFolderResponse>>> GetFolders(CancellationToken cancellationToken)
        => Ok(await mediaService.GetFoldersAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateFolder(MediaFolderCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediaService.CreateFolderAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFolder(int id, CancellationToken cancellationToken)
    {
        try
        {
            return await mediaService.DeleteFolderAsync(id, cancellationToken) ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    private Guid GetActorUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId)
            ? parsedUserId
            : throw new UnauthorizedAccessException("User id claim is missing.");
    }

    private string GetIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) && !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

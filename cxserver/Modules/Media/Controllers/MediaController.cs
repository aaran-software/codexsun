using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Media.DTOs;
using cxserver.Modules.Media.Services;

namespace cxserver.Modules.Media.Controllers;

[ApiController]
[Route("media")]
[Authorize]
public sealed class MediaController(MediaService mediaService) : ControllerBase
{
    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Upload([FromForm] MediaUploadRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await mediaService.UploadFileAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("files")]
    public async Task<ActionResult<IReadOnlyList<MediaFileResponse>>> GetFiles([FromQuery] string? search, [FromQuery] int? folderId, [FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
        => Ok(await mediaService.GetFilesAsync(search, folderId, includeDeleted, cancellationToken));

    [HttpGet("files/{id:int}")]
    public async Task<IActionResult> GetFile(int id, CancellationToken cancellationToken)
    {
        var file = await mediaService.GetFileAsync(id, cancellationToken);
        return file is null ? NotFound() : Ok(file);
    }

    [HttpDelete("files/{id:int}")]
    public async Task<IActionResult> DeleteFile(int id, CancellationToken cancellationToken)
        => await mediaService.DeleteFileAsync(id, GetActorUserId(), GetIpAddress(), cancellationToken) ? NoContent() : NotFound();

    [HttpPost("files/{id:int}/restore")]
    public async Task<IActionResult> RestoreFile(int id, CancellationToken cancellationToken)
        => await mediaService.RestoreFileAsync(id, GetActorUserId(), GetIpAddress(), cancellationToken) ? Ok() : NotFound();

    [HttpPost("files/{id:int}/move")]
    public async Task<IActionResult> MoveFile(int id, MediaMoveRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var file = await mediaService.MoveFileAsync(id, request, cancellationToken);
            return file is null ? NotFound() : Ok(file);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("files/{id:int}/rename")]
    public async Task<IActionResult> RenameFile(int id, MediaRenameRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var file = await mediaService.RenameFileAsync(id, request, GetActorUserId(), GetIpAddress(), cancellationToken);
            return file is null ? NotFound() : Ok(file);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("files/{id:int}/usage")]
    public async Task<IActionResult> RecordUsage(int id, MediaUsageRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await mediaService.RecordUsageAsync(id, request, cancellationToken);
            return Ok();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("files/{id:int}/usage")]
    public async Task<IActionResult> RemoveUsage(int id, [FromQuery] string module, [FromQuery] string entityId, [FromQuery] string entityType, [FromQuery] string usageType, CancellationToken cancellationToken)
    {
        await mediaService.RemoveUsageAsync(id, new MediaUsageRequest
        {
            Module = module,
            EntityId = entityId,
            EntityType = entityType,
            UsageType = usageType
        }, cancellationToken);
        return NoContent();
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

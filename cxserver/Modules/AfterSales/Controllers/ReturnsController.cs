using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.AfterSales.DTOs;
using cxserver.Modules.AfterSales.Services;

namespace cxserver.Modules.AfterSales.Controllers;

[ApiController]
[Route("returns")]
[Authorize]
public sealed class ReturnsController(AfterSalesService afterSalesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReturnSummaryResponse>>> GetReturns(CancellationToken cancellationToken)
        => Ok(await afterSalesService.GetReturnsAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReturn(int id, CancellationToken cancellationToken)
    {
        var entity = await afterSalesService.GetReturnByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReturn(CreateReturnRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await afterSalesService.CreateReturnRequestAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> ApproveReturn(int id, ApproveReturnRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await afterSalesService.ApproveReturnAsync(id, request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return entity is null ? NotFound() : Ok(entity);
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

    private string GetActorRole()
        => User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    private string GetIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) && !string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.ToString().Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

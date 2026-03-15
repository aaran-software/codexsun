using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.AfterSales.DTOs;
using cxserver.Modules.AfterSales.Services;

namespace cxserver.Modules.AfterSales.Controllers;

[ApiController]
[Route("refunds")]
[Authorize]
public sealed class RefundsController(AfterSalesService afterSalesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RefundSummaryResponse>>> GetRefunds(CancellationToken cancellationToken)
        => Ok(await afterSalesService.GetRefundsAsync(cancellationToken));

    [HttpPost("process")]
    public async Task<IActionResult> ProcessRefund(ProcessRefundRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var refund = await afterSalesService.ProcessRefundAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return refund is null ? NotFound() : Ok(refund);
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

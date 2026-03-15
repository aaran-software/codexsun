using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;

namespace cxserver.Modules.Sales.Controllers;

[ApiController]
[Route("vendor-payouts")]
[Authorize]
public sealed class VendorPayoutsController(SalesService salesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendorPayoutSummaryResponse>>> GetVendorPayouts(CancellationToken cancellationToken = default)
        => Ok(await salesService.GetVendorPayoutsAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateVendorPayout(CreateVendorPayoutRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await salesService.CreateVendorPayoutAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> ApproveVendorPayout(int id, ApproveVendorPayoutRequest request, CancellationToken cancellationToken)
    {
        var updated = await salesService.ApproveVendorPayoutAsync(id, request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
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

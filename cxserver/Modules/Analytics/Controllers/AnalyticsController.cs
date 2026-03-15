using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Analytics.Services;

namespace cxserver.Modules.Analytics.Controllers;

[ApiController]
[Route("analytics")]
[Authorize]
public sealed class AnalyticsController(AnalyticsService analyticsService) : ControllerBase
{
    [HttpGet("vendors/{vendorId:int}/sales")]
    public async Task<IActionResult> GetVendorSalesSummary(int vendorId, [FromQuery] DateTimeOffset? periodStart,
        [FromQuery] DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        try
        {
            var summary = await analyticsService.GetVendorSalesSummaryAsync(vendorId, GetActorUserId(), GetActorRole(), periodStart, periodEnd, cancellationToken);
            return summary is null ? NotFound() : Ok(summary);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("products/{productId:int}/sales")]
    public async Task<IActionResult> GetProductSalesSummary(int productId, [FromQuery] DateTimeOffset? periodStart,
        [FromQuery] DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        try
        {
            var summary = await analyticsService.GetProductSalesSummaryAsync(productId, periodStart, periodEnd, cancellationToken);
            return summary is null ? NotFound() : Ok(summary);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("sales-overview")]
    public async Task<IActionResult> GetSalesOverview([FromQuery] DateTimeOffset? periodStart,
        [FromQuery] DateTimeOffset? periodEnd, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await analyticsService.GetSalesOverviewAsync(periodStart, periodEnd, cancellationToken));
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
}

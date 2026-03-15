using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Promotions.DTOs;
using cxserver.Modules.Promotions.Services;

namespace cxserver.Modules.Promotions.Controllers;

[ApiController]
[Route("coupons")]
[Authorize]
public sealed class CouponsController(PromotionService promotionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CouponResponse>>> GetCoupons(CancellationToken cancellationToken)
        => Ok(await promotionService.GetCouponsAsync(cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateCoupon(CouponUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await promotionService.CreateCouponAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResponse>> ValidateCoupon(ValidateCouponRequest request, CancellationToken cancellationToken)
        => Ok(await promotionService.ValidateCouponAsync(request, GetActorUserId(), cancellationToken));

    [HttpPost("apply")]
    public async Task<IActionResult> ApplyCoupon(ApplyCouponRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await promotionService.ApplyCouponAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken));
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
            : Guid.Empty;
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

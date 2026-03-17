using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Storefront.DTOs;
using cxserver.Modules.Storefront.Services;

namespace cxserver.Modules.Storefront.Controllers;

[ApiController]
public sealed class ReviewsController(StorefrontService storefrontService) : ControllerBase
{
    [HttpGet("storefront/products/{productId:int}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProductReviews(int productId, CancellationToken cancellationToken)
        => Ok(await storefrontService.GetProductReviewsAsync(productId, cancellationToken));

    [HttpGet("reviews/my")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAccess)]
    public async Task<IActionResult> GetMyReviews(CancellationToken cancellationToken)
        => Ok(await storefrontService.GetMyReviewsAsync(GetActorUserId(), cancellationToken));

    [HttpPost("reviews")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAccess)]
    public async Task<IActionResult> CreateReview(ProductReviewCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await storefrontService.CreateProductReviewAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
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

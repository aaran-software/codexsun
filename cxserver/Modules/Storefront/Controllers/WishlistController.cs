using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Storefront.DTOs;
using cxserver.Modules.Storefront.Services;

namespace cxserver.Modules.Storefront.Controllers;

[ApiController]
[Route("wishlist")]
[Authorize(Policy = AuthorizationPolicies.CustomerAccess)]
public sealed class WishlistController(StorefrontService storefrontService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWishlist(CancellationToken cancellationToken)
        => Ok(await storefrontService.GetWishlistAsync(GetActorUserId(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> AddItem(WishlistAddRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await storefrontService.AddWishlistItemAsync(request.ProductId, GetActorUserId(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> RemoveItem(int productId, CancellationToken cancellationToken)
        => await storefrontService.RemoveWishlistItemAsync(productId, GetActorUserId(), GetIpAddress(), cancellationToken) ? NoContent() : NotFound();

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await storefrontService.ClearWishlistAsync(GetActorUserId(), GetIpAddress(), cancellationToken);
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

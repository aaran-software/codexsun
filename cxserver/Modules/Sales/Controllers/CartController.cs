using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;

namespace cxserver.Modules.Sales.Controllers;

[ApiController]
[Route("cart")]
[AllowAnonymous]
public sealed class CartController(SalesService salesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart([FromQuery] string sessionId = "", CancellationToken cancellationToken = default)
        => Ok(await salesService.GetCartAsync(GetActorUserIdOrDefault(), sessionId, cancellationToken));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(CartItemUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await salesService.AddItemToCartAsync(request, GetActorUserIdOrDefault(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("items/{id:int}")]
    public async Task<IActionResult> UpdateItem(int id, CartItemUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var cart = await salesService.UpdateCartItemAsync(id, request, GetActorUserIdOrDefault(), ResolveSessionId(request.SessionId), cancellationToken);
            return cart is null ? NotFound() : Ok(cart);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("items/{id:int}")]
    public async Task<IActionResult> RemoveItem(int id, [FromQuery] string sessionId = "", CancellationToken cancellationToken = default)
        => await salesService.RemoveCartItemAsync(id, GetActorUserIdOrDefault(), ResolveSessionId(sessionId), cancellationToken) ? NoContent() : NotFound();

    [HttpDelete]
    public async Task<IActionResult> Clear([FromQuery] string sessionId = "", CancellationToken cancellationToken = default)
        => await salesService.ClearCartAsync(GetActorUserIdOrDefault(), sessionId, cancellationToken) ? NoContent() : NotFound();

    private Guid? GetActorUserIdOrDefault()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }

    private string ResolveSessionId(string fallbackSessionId = "")
    {
        if (Request.Headers.TryGetValue("X-Cart-Session-Id", out var sessionId) && !string.IsNullOrWhiteSpace(sessionId))
        {
            return sessionId.ToString().Trim();
        }

        return fallbackSessionId.Trim();
    }
}

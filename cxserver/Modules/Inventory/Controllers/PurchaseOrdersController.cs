using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Services;

namespace cxserver.Modules.Inventory.Controllers;

[ApiController]
[Route("inventory/purchase-orders")]
[Authorize]
public sealed class PurchaseOrdersController(InventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PurchaseOrderResponse>>> GetPurchaseOrders(CancellationToken cancellationToken = default)
        => Ok(await inventoryService.GetPurchaseOrdersAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPurchaseOrder(int id, CancellationToken cancellationToken)
    {
        var purchaseOrder = await inventoryService.GetPurchaseOrderByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return purchaseOrder is null ? NotFound() : Ok(purchaseOrder);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePurchaseOrder(PurchaseOrderCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await inventoryService.CreatePurchaseOrderAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/receive")]
    public async Task<IActionResult> ReceivePurchaseOrder(int id, PurchaseOrderReceiveRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var purchaseOrder = await inventoryService.ReceivePurchaseOrderAsync(id, request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return purchaseOrder is null ? NotFound() : Ok(purchaseOrder);
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

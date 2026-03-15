using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Services;

namespace cxserver.Modules.Inventory.Controllers;

[ApiController]
[Route("inventory")]
[Authorize]
public sealed class InventoryController(InventoryService inventoryService) : ControllerBase
{
    [HttpGet("products/{productId:int}")]
    public async Task<ActionResult<IReadOnlyList<InventorySummaryResponse>>> GetProductInventory(int productId, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await inventoryService.GetProductInventoryAsync(productId, GetActorUserId(), GetActorRole(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("warehouse/{warehouseId:int}")]
    public async Task<ActionResult<IReadOnlyList<InventorySummaryResponse>>> GetWarehouseInventory(int warehouseId, CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await inventoryService.GetWarehouseInventoryAsync(warehouseId, GetActorUserId(), GetActorRole(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("adjustments")]
    public async Task<IActionResult> AdjustInventory(InventoryAdjustmentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await inventoryService.AdjustInventoryAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
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

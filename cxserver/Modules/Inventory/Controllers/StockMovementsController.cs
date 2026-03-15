using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Services;

namespace cxserver.Modules.Inventory.Controllers;

[ApiController]
[Route("inventory/movements")]
[Authorize]
public sealed class StockMovementsController(InventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StockMovementResponse>>> GetMovements(CancellationToken cancellationToken = default)
        => Ok(await inventoryService.GetStockMovementsAsync(GetActorUserId(), GetActorRole(), cancellationToken));

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

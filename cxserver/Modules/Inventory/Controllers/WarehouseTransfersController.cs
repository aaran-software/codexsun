using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Inventory.DTOs;
using cxserver.Modules.Inventory.Services;

namespace cxserver.Modules.Inventory.Controllers;

[ApiController]
[Route("inventory/transfers")]
[Authorize]
public sealed class WarehouseTransfersController(InventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransferResponse>>> GetTransfers(CancellationToken cancellationToken = default)
        => Ok(await inventoryService.GetTransfersAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateTransfer(TransferCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await inventoryService.CreateTransferAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> CompleteTransfer(int id, CancellationToken cancellationToken)
    {
        try
        {
            var transfer = await inventoryService.CompleteTransferAsync(id, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return transfer is null ? NotFound() : Ok(transfer);
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

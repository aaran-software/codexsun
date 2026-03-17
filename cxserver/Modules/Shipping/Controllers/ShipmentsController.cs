using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Shipping.DTOs;
using cxserver.Modules.Shipping.Services;

namespace cxserver.Modules.Shipping.Controllers;

[ApiController]
[Route("shipments")]
[Authorize]
public sealed class ShipmentsController(ShippingService shippingService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShipmentResponse>>> GetShipments(CancellationToken cancellationToken)
        => Ok(await shippingService.GetShipmentsAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("methods")]
    public async Task<ActionResult<IReadOnlyList<ShippingMethodResponse>>> GetShippingMethods(CancellationToken cancellationToken)
        => Ok(await shippingService.GetShippingMethodsAsync(cancellationToken));

    [HttpGet("order/{orderId:int}")]
    public async Task<ActionResult<IReadOnlyList<ShipmentResponse>>> GetShipmentsForOrder(int orderId, CancellationToken cancellationToken)
        => Ok(await shippingService.GetShipmentsForOrderAsync(orderId, GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateShipment(ShipmentCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await shippingService.CreateShipmentAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("auto-create/{orderId:int}")]
    public async Task<IActionResult> AutoCreateShipment(int orderId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await shippingService.EnsureShipmentForOrderAsync(orderId, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> UpdateShipmentStatus(int id, ShipmentStatusUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var shipment = await shippingService.UpdateShipmentStatusAsync(id, request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return shipment is null ? NotFound() : Ok(shipment);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("{trackingNumber}")]
    public async Task<IActionResult> TrackShipment(string trackingNumber, CancellationToken cancellationToken)
    {
        var shipment = await shippingService.TrackShipmentAsync(trackingNumber, GetActorUserId(), GetActorRole(), cancellationToken);
        return shipment is null ? NotFound() : Ok(shipment);
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

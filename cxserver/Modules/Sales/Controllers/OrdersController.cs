using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;

namespace cxserver.Modules.Sales.Controllers;

[ApiController]
[Route("orders")]
[Authorize]
public sealed class OrdersController(SalesService salesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryResponse>>> GetOrders(CancellationToken cancellationToken = default)
        => Ok(await salesService.GetOrdersAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id, CancellationToken cancellationToken)
    {
        var order = await salesService.GetOrderByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await salesService.CreateOrderAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return CreatedAtAction(nameof(GetOrder), new { id = created.Id }, created);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await salesService.UpdateOrderStatusAsync(id, request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
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

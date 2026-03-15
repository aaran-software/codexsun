using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;

namespace cxserver.Modules.Sales.Controllers;

[ApiController]
[Route("invoices")]
[Authorize]
public sealed class InvoicesController(SalesService salesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InvoiceSummaryResponse>>> GetInvoices(CancellationToken cancellationToken = default)
        => Ok(await salesService.GetInvoicesAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetInvoice(int id, CancellationToken cancellationToken)
    {
        var invoice = await salesService.GetInvoiceByIdAsync(id, GetActorUserId(), GetActorRole(), cancellationToken);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice(CreateInvoiceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await salesService.CreateInvoiceAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken);
            return CreatedAtAction(nameof(GetInvoice), new { id = created.Id }, created);
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

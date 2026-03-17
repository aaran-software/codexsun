using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Sales.DTOs;
using cxserver.Modules.Sales.Services;

namespace cxserver.Modules.Sales.Controllers;

[ApiController]
[Route("payments/razorpay")]
public sealed class RazorpayPaymentsController(SalesService salesService) : ControllerBase
{
    [HttpPost("checkout")]
    [Authorize]
    public async Task<IActionResult> InitializeCheckout(InitializeRazorpayCheckoutRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await salesService.InitializeRazorpayCheckoutAsync(request, GetActorUserId(), GetActorRole(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("verify")]
    [Authorize]
    public async Task<IActionResult> VerifyPayment(VerifyRazorpayPaymentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await salesService.VerifyRazorpayPaymentAsync(request, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("reconcile/{orderId:int}")]
    [Authorize]
    public async Task<IActionResult> ReconcilePayment(int orderId, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await salesService.ReconcileRazorpayOrderAsync(orderId, GetActorUserId(), GetActorRole(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var body = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["X-Razorpay-Signature"].ToString();
        var accepted = await salesService.HandleRazorpayWebhookAsync(body, signature, cancellationToken);
        return accepted ? Ok(new { received = true }) : Unauthorized();
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

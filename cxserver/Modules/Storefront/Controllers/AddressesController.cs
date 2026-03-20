using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Storefront.DTOs;
using cxserver.Modules.Storefront.Services;

namespace cxserver.Modules.Storefront.Controllers;

[ApiController]
[Route("storefront/addresses")]
[Authorize(Policy = AuthorizationPolicies.CustomerAccess)]
public sealed class AddressesController(StorefrontService storefrontService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAddresses(CancellationToken cancellationToken)
        => Ok(await storefrontService.GetCustomerAddressesAsync(GetActorUserId(), cancellationToken));

    [HttpPost]
    public async Task<IActionResult> CreateAddress(CustomerAddressUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await storefrontService.UpsertCustomerAddressAsync(null, request, GetActorUserId(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{addressId:int}")]
    public async Task<IActionResult> UpdateAddress(int addressId, CustomerAddressUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await storefrontService.UpsertCustomerAddressAsync(addressId, request, GetActorUserId(), GetIpAddress(), cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{addressId:int}")]
    public async Task<IActionResult> DeleteAddress(int addressId, CancellationToken cancellationToken)
        => await storefrontService.DeleteCustomerAddressAsync(addressId, GetActorUserId(), GetIpAddress(), cancellationToken) ? NoContent() : NotFound();

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

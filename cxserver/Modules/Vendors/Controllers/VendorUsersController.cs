using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Vendors.DTOs;
using cxserver.Modules.Vendors.Services;

namespace cxserver.Modules.Vendors.Controllers;

[ApiController]
[Route("vendors/{vendorId:int}/users")]
[Authorize]
public sealed class VendorUsersController(VendorService vendorService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendorUserResponse>>> GetVendorUsers(int vendorId, CancellationToken cancellationToken)
        => Ok(await vendorService.GetVendorUsersAsync(vendorId, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> AssignVendorUser(int vendorId, AssignVendorUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await vendorService.AssignVendorUserAsync(vendorId, request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}

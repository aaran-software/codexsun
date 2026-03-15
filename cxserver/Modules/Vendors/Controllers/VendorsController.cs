using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Common.DTOs;
using cxserver.Modules.Vendors.DTOs;
using cxserver.Modules.Vendors.Services;

namespace cxserver.Modules.Vendors.Controllers;

[ApiController]
[Route("vendors")]
[Authorize]
public sealed class VendorsController(VendorService vendorService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendorSummaryResponse>>> GetVendors(CancellationToken cancellationToken)
        => Ok(await vendorService.GetVendorsAsync(cancellationToken));

    [HttpGet("warehouses")]
    public async Task<ActionResult<IReadOnlyList<CommonMasterDataResponse>>> GetAccessibleWarehouses(CancellationToken cancellationToken)
        => Ok(await vendorService.GetAccessibleWarehousesAsync(GetActorUserId(), GetActorRole(), cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVendor(int id, CancellationToken cancellationToken)
    {
        var vendor = await vendorService.GetVendorDetailsAsync(id, cancellationToken);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(VendorUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await vendorService.CreateVendorAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVendor(int id, VendorUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var vendor = await vendorService.UpdateVendorProfileAsync(id, request, cancellationToken);
            return vendor is null ? NotFound() : Ok(vendor);
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
}

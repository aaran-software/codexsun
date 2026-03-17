using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Vendors.DTOs;
using cxserver.Modules.Vendors.Services;

namespace cxserver.Modules.Vendors.Controllers;

[ApiController]
[Route("storefront/vendors")]
[AllowAnonymous]
public sealed class StorefrontVendorsController(VendorService vendorService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VendorSummaryResponse>>> GetVendors(
        [FromQuery] int? limit,
        CancellationToken cancellationToken = default)
        => Ok(await vendorService.GetStorefrontVendorsAsync(limit, cancellationToken));
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Company.DTOs;
using cxserver.Modules.Company.Services;

namespace cxserver.Modules.Company.Controllers;

[ApiController]
[Route("company")]
public sealed class CompanyController(CompanyService companyService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<CompanyResponse>> GetCompany(CancellationToken cancellationToken)
        => Ok(await companyService.GetCompanyAsync(cancellationToken));

    [HttpPut]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> UpdateCompany(CompanyUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await companyService.UpdateCompanyAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken));
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

    private string GetIpAddress()
        => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

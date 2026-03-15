using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Company.DTOs;
using cxserver.Modules.Company.Services;

namespace cxserver.Modules.Company.Controllers;

[ApiController]
[Route("company/settings")]
[Authorize(Policy = AuthorizationPolicies.AdminAccess)]
public sealed class CompanySettingsController(CompanyService companyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CompanySettingResponse>>> GetSettings(CancellationToken cancellationToken)
        => Ok(await companyService.GetCompanySettingsAsync(cancellationToken));

    [HttpPut]
    public async Task<IActionResult> UpdateSettings(CompanySettingsUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await companyService.UpdateCompanySettingsAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken));
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

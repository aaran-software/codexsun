using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using cxserver.Modules.Auth.DTOs;
using cxserver.Modules.Auth.Policies;
using cxserver.Modules.Auth.Services;

namespace cxserver.Modules.Auth.Controllers;

[ApiController]
[Route("auth")]
public sealed class AuthController(
    AuthService authService,
    IValidator<LoginRequest> loginValidator,
    IValidator<RegisterRequest> registerValidator) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var validation = await registerValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
        }

        try
        {
            var response = await authService.RegisterAsync(request, GetIpAddress(), cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await loginValidator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));
        }

        try
        {
            var response = await authService.LoginAsync(request, GetIpAddress(), cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Refresh(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await authService.RefreshAsync(request.RefreshToken, GetIpAddress(), cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(request.RefreshToken, GetIpAddress(), cancellationToken);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return Unauthorized();
        }

        var user = await authService.GetCurrentUserAsync(parsedUserId, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpGet("access/admin")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public IActionResult AdminAccess() => Ok(new { access = "admin" });

    [HttpGet("access/vendor")]
    [Authorize(Policy = AuthorizationPolicies.VendorAccess)]
    public IActionResult VendorAccess() => Ok(new { access = "vendor" });

    [HttpGet("access/customer")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAccess)]
    public IActionResult CustomerAccess() => Ok(new { access = "customer" });

    [HttpGet("users")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<ActionResult<IReadOnlyList<UserListItemResponse>>> GetUsers(CancellationToken cancellationToken)
        => Ok(await authService.GetUsersAsync(cancellationToken));

    [HttpGet("users/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken cancellationToken)
    {
        var user = await authService.GetUserByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost("users")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> CreateUser(CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createdUser = await authService.CreateUserAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("users/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updatedUser = await authService.UpdateUserAsync(id, request, GetActorUserId(), GetIpAddress(), cancellationToken);
            return updatedUser is null ? NotFound() : Ok(updatedUser);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("users/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await authService.SoftDeleteUserAsync(id, GetActorUserId(), GetIpAddress(), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("users/{id:guid}/restore")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> RestoreUser(Guid id, CancellationToken cancellationToken)
    {
        var restored = await authService.RestoreUserAsync(id, GetActorUserId(), GetIpAddress(), cancellationToken);
        return restored ? NoContent() : NotFound();
    }

    [HttpGet("roles")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<ActionResult<IReadOnlyList<RoleListItemResponse>>> GetRoles(CancellationToken cancellationToken)
        => Ok(await authService.GetRolesAsync(cancellationToken));

    [HttpGet("roles/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> GetRole(Guid id, CancellationToken cancellationToken)
    {
        var role = await authService.GetRoleByIdAsync(id, cancellationToken);
        return role is null ? NotFound() : Ok(role);
    }

    [HttpPost("roles")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> CreateRole(CreateRoleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var createdRole = await authService.CreateRoleAsync(request, GetActorUserId(), GetIpAddress(), cancellationToken);
            return CreatedAtAction(nameof(GetRole), new { id = createdRole.Id }, createdRole);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPut("roles/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> UpdateRole(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updatedRole = await authService.UpdateRoleAsync(id, request, GetActorUserId(), GetIpAddress(), cancellationToken);
            return updatedRole is null ? NotFound() : Ok(updatedRole);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("permissions")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<ActionResult<IReadOnlyList<PermissionResponse>>> GetPermissions(CancellationToken cancellationToken)
        => Ok(await authService.GetPermissionsAsync(cancellationToken));

    [HttpGet("roles/{id:guid}/permissions")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> GetRolePermissions(Guid id, CancellationToken cancellationToken)
    {
        var permissionIds = await authService.GetRolePermissionIdsAsync(id, cancellationToken);
        return permissionIds is null ? NotFound() : Ok(permissionIds);
    }

    [HttpPut("roles/{id:guid}/permissions")]
    [Authorize(Policy = AuthorizationPolicies.AdminAccess)]
    public async Task<IActionResult> UpdateRolePermissions(Guid id, UpdateRolePermissionsRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await authService.UpdateRolePermissionsAsync(id, request.PermissionIds, GetActorUserId(), GetIpAddress(), cancellationToken);
            return updated ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    private Guid? GetActorUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }

    private string GetIpAddress() => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

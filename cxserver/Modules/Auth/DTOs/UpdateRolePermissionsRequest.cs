namespace cxserver.Modules.Auth.DTOs;

public sealed class UpdateRolePermissionsRequest
{
    public IReadOnlyCollection<Guid> PermissionIds { get; set; } = [];
}

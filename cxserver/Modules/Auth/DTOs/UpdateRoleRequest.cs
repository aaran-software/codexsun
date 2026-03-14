namespace cxserver.Modules.Auth.DTOs;

public sealed class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

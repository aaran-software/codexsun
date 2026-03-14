namespace cxserver.Modules.Auth.DTOs;

public sealed class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

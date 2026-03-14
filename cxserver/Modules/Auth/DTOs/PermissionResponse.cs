namespace cxserver.Modules.Auth.DTOs;

public sealed class PermissionResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

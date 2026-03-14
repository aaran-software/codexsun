namespace cxserver.Modules.Auth.DTOs;

public sealed class RoleListItemResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UserCount { get; set; }
}

namespace cxserver.Modules.Auth.DTOs;

public sealed class UpdateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public string? Password { get; set; }
    public string Status { get; set; } = "Active";
}

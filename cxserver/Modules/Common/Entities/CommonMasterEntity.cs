namespace cxserver.Modules.Common.Entities;

public abstract class CommonMasterEntity
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public abstract class NamedCommonMasterEntity : CommonMasterEntity
{
    public string Name { get; set; } = string.Empty;
}

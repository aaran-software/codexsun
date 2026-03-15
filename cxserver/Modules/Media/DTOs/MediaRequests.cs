using Microsoft.AspNetCore.Http;

namespace cxserver.Modules.Media.DTOs;

public sealed class MediaUploadRequest
{
    public IFormFile File { get; set; } = null!;
    public int? FolderId { get; set; }
    public string Module { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string UsageType { get; set; } = string.Empty;
}

public sealed class MediaFolderCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public int? ParentFolderId { get; set; }
}

public sealed class MediaMoveRequest
{
    public int? FolderId { get; set; }
}

public sealed class MediaUsageRequest
{
    public string Module { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string UsageType { get; set; } = string.Empty;
}

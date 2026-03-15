namespace cxserver.Modules.Media.DTOs;

public sealed class MediaUsageResponse
{
    public int Id { get; set; }
    public string Module { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string UsageType { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class MediaFolderResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ParentFolderId { get; set; }
    public string Path { get; set; } = string.Empty;
    public int FileCount { get; set; }
    public int ChildFolderCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class MediaFileResponse
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string Extension { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = string.Empty;
    public int? FolderId { get; set; }
    public string FolderName { get; set; } = string.Empty;
    public Guid UploadedByUserId { get; set; }
    public string UploadedByUsername { get; set; } = string.Empty;
    public string Checksum { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string MediumUrl { get; set; } = string.Empty;
    public string LargeUrl { get; set; } = string.Empty;
    public List<MediaUsageResponse> Usage { get; set; } = [];
}

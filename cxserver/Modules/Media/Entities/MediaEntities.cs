using cxserver.Modules.Auth.Entities;

namespace cxserver.Modules.Media.Entities;

public abstract class MediaEntity
{
    public int Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class MediaFolder : MediaEntity
{
    public string Name { get; set; } = string.Empty;
    public int? ParentFolderId { get; set; }
    public MediaFolder? ParentFolder { get; set; }
    public string Path { get; set; } = string.Empty;
    public ICollection<MediaFolder> ChildFolders { get; set; } = [];
    public ICollection<MediaFile> Files { get; set; } = [];
}

public sealed class MediaFile : MediaEntity
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string Extension { get; set; } = string.Empty;
    public string StorageProvider { get; set; } = string.Empty;
    public int? FolderId { get; set; }
    public MediaFolder? Folder { get; set; }
    public Guid UploadedByUserId { get; set; }
    public User UploadedByUser { get; set; } = null!;
    public string Checksum { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public ICollection<MediaUsage> UsageEntries { get; set; } = [];
}

public sealed class MediaUsage
{
    public int Id { get; set; }
    public int MediaFileId { get; set; }
    public MediaFile MediaFile { get; set; } = null!;
    public string Module { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string UsageType { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

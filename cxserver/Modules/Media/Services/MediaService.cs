using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Auth.Entities;
using cxserver.Modules.Media.DTOs;
using cxserver.Modules.Media.Entities;

namespace cxserver.Modules.Media.Services;

public sealed class MediaService(CodexsunDbContext dbContext, IFileStorageProvider storageProvider)
{
    private const int MaxFileSizeBytes = 20 * 1024 * 1024;

    private static readonly Dictionary<string, string[]> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = ["image/jpeg"],
        [".jpeg"] = ["image/jpeg"],
        [".png"] = ["image/png"],
        [".webp"] = ["image/webp"],
        [".svg"] = ["image/svg+xml"],
        [".pdf"] = ["application/pdf"],
        [".doc"] = ["application/msword", "application/octet-stream"],
        [".docx"] = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"],
        [".xls"] = ["application/vnd.ms-excel", "application/octet-stream"],
        [".xlsx"] = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"]
    };

    private static readonly HashSet<string> ImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    private static readonly HashSet<string> ThumbnailCapableExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public async Task<MediaFileResponse> UploadFileAsync(MediaUploadRequest request, Guid actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        ValidateUploadRequest(request.File);
        var fileBytes = await ReadFileAsync(request.File, cancellationToken);
        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        ValidateFile(request.File.ContentType, extension, fileBytes.LongLength);

        var folder = request.FolderId.HasValue
            ? await dbContext.MediaFolders.SingleOrDefaultAsync(x => x.Id == request.FolderId.Value, cancellationToken)
            : null;

        if (request.FolderId.HasValue && folder is null)
        {
            throw new InvalidOperationException("Media folder was not found.");
        }

        var folderPath = folder?.Path;
        if (string.IsNullOrWhiteSpace(folderPath))
        {
            folderPath = ResolveDefaultFolderPath(request.Module, extension);
        }

        var checksum = Convert.ToHexString(SHA256.HashData(fileBytes)).ToLowerInvariant();
        var stored = await storageProvider.SaveFileAsync(
            folderPath,
            extension,
            fileBytes,
            ImageExtensions.Contains(extension),
            ThumbnailCapableExtensions.Contains(extension),
            cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var entity = new MediaFile
        {
            FileName = stored.FileName,
            OriginalFileName = Path.GetFileName(request.File.FileName),
            FilePath = stored.FilePath,
            FileUrl = stored.FileUrl,
            FileSize = fileBytes.LongLength,
            MimeType = NormalizeMimeType(request.File.ContentType, extension),
            Extension = extension.TrimStart('.'),
            StorageProvider = storageProvider.ProviderName,
            FolderId = folder?.Id,
            UploadedByUserId = actorUserId,
            Checksum = checksum,
            IsDeleted = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.MediaFiles.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Module)
            && !string.IsNullOrWhiteSpace(request.EntityId)
            && !string.IsNullOrWhiteSpace(request.EntityType)
            && !string.IsNullOrWhiteSpace(request.UsageType))
        {
            await RecordUsageAsync(entity.Id, new MediaUsageRequest
            {
                Module = request.Module,
                EntityId = request.EntityId,
                EntityType = request.EntityType,
                UsageType = request.UsageType
            }, cancellationToken);
        }

        await WriteAuditLogAsync(actorUserId, "Media.Upload", nameof(MediaFile), entity.Id.ToString(), ipAddress, cancellationToken);
        return await GetFileRequiredAsync(entity.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<MediaFileResponse>> GetFilesAsync(string? search, int? folderId, bool includeDeleted, CancellationToken cancellationToken)
    {
        var query = dbContext.MediaFiles
            .AsNoTracking()
            .Include(x => x.Folder)
            .Include(x => x.UploadedByUser)
            .Include(x => x.UsageEntries)
            .AsQueryable();

        if (folderId.HasValue)
        {
            query = query.Where(x => x.FolderId == folderId.Value);
        }

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.FileName.ToLower().Contains(term)
                || x.OriginalFileName.ToLower().Contains(term)
                || x.Checksum.ToLower().Contains(term));
        }

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .ToListAsync(cancellationToken);

        return entities.Select(MapFile).ToList();
    }

    public async Task<MediaFileResponse?> GetFileAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.MediaFiles
            .AsNoTracking()
            .Include(x => x.Folder)
            .Include(x => x.UploadedByUser)
            .Include(x => x.UsageEntries)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity is null ? null : MapFile(entity);
    }

    public async Task<bool> DeleteFileAsync(int id, Guid actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var entity = await dbContext.MediaFiles.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        if (entity.IsDeleted)
        {
            return true;
        }

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Media.Delete", nameof(MediaFile), entity.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task<bool> RestoreFileAsync(int id, Guid actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        var entity = await dbContext.MediaFiles.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        if (!entity.IsDeleted)
        {
            return true;
        }

        entity.IsDeleted = false;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Media.Restore", nameof(MediaFile), entity.Id.ToString(), ipAddress, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<MediaFolderResponse>> GetFoldersAsync(CancellationToken cancellationToken)
    {
        return await dbContext.MediaFolders
            .AsNoTracking()
            .Include(x => x.Files)
            .Include(x => x.ChildFolders)
            .OrderBy(x => x.Path)
            .Select(x => new MediaFolderResponse
            {
                Id = x.Id,
                Name = x.Name,
                ParentFolderId = x.ParentFolderId,
                Path = x.Path,
                FileCount = x.Files.Count(file => !file.IsDeleted),
                ChildFolderCount = x.ChildFolders.Count,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<MediaFolderResponse> CreateFolderAsync(MediaFolderCreateRequest request, Guid actorUserId, string ipAddress, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Folder name is required.");
        }

        MediaFolder? parent = null;
        if (request.ParentFolderId.HasValue)
        {
            parent = await dbContext.MediaFolders.SingleOrDefaultAsync(x => x.Id == request.ParentFolderId.Value, cancellationToken)
                ?? throw new InvalidOperationException("Parent folder was not found.");
        }

        var slug = Slugify(request.Name);
        var path = string.IsNullOrWhiteSpace(parent?.Path) ? slug : $"{parent!.Path}/{slug}";
        var exists = await dbContext.MediaFolders.AnyAsync(x => x.Path == path, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A folder with the same path already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new MediaFolder
        {
            Name = request.Name.Trim(),
            ParentFolderId = parent?.Id,
            Path = path,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.MediaFolders.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        await WriteAuditLogAsync(actorUserId, "Media.CreateFolder", nameof(MediaFolder), entity.Id.ToString(), ipAddress, cancellationToken);
        return (await GetFoldersAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<bool> DeleteFolderAsync(int id, CancellationToken cancellationToken)
    {
        var folder = await dbContext.MediaFolders
            .Include(x => x.Files)
            .Include(x => x.ChildFolders)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (folder is null)
        {
            return false;
        }

        if (folder.Files.Any(x => !x.IsDeleted) || folder.ChildFolders.Count != 0)
        {
            throw new InvalidOperationException("Only empty folders can be deleted.");
        }

        dbContext.MediaFolders.Remove(folder);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<MediaFileResponse?> MoveFileAsync(int id, MediaMoveRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.MediaFiles
            .Include(x => x.Folder)
            .Include(x => x.UploadedByUser)
            .Include(x => x.UsageEntries)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        MediaFolder? folder = null;
        if (request.FolderId.HasValue)
        {
            folder = await dbContext.MediaFolders.SingleOrDefaultAsync(x => x.Id == request.FolderId.Value, cancellationToken)
                ?? throw new InvalidOperationException("Target folder was not found.");
        }

        var moved = await storageProvider.MoveFileAsync(new StoredMediaFile
        {
            FileName = entity.FileName,
            FilePath = entity.FilePath,
            FileUrl = entity.FileUrl,
            ThumbnailUrl = BuildDerivedUrl(entity, "thumbnail"),
            MediumUrl = BuildDerivedUrl(entity, "medium"),
            LargeUrl = BuildDerivedUrl(entity, "large")
        }, folder?.Path ?? ResolveDefaultFolderPath(string.Empty, $".{entity.Extension}"), cancellationToken);

        entity.FolderId = folder?.Id;
        entity.FilePath = moved.FilePath;
        entity.FileUrl = moved.FileUrl;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapFile(entity);
    }

    public async Task RecordUsageAsync(int mediaFileId, MediaUsageRequest request, CancellationToken cancellationToken)
    {
        ValidateUsageRequest(request);
        var exists = await dbContext.MediaUsage.AnyAsync(
            x => x.MediaFileId == mediaFileId
                && x.Module == request.Module.Trim()
                && x.EntityId == request.EntityId.Trim()
                && x.UsageType == request.UsageType.Trim(),
            cancellationToken);

        if (exists)
        {
            return;
        }

        dbContext.MediaUsage.Add(new MediaUsage
        {
            MediaFileId = mediaFileId,
            Module = request.Module.Trim(),
            EntityId = request.EntityId.Trim(),
            EntityType = request.EntityType.Trim(),
            UsageType = request.UsageType.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveUsageAsync(int mediaFileId, MediaUsageRequest request, CancellationToken cancellationToken)
    {
        var entity = await dbContext.MediaUsage.SingleOrDefaultAsync(
            x => x.MediaFileId == mediaFileId
                && x.Module == request.Module.Trim()
                && x.EntityId == request.EntityId.Trim()
                && x.UsageType == request.UsageType.Trim(),
            cancellationToken);

        if (entity is null)
        {
            return;
        }

        dbContext.MediaUsage.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<MediaFileResponse> GetFileRequiredAsync(int id, CancellationToken cancellationToken)
        => await GetFileAsync(id, cancellationToken) ?? throw new InvalidOperationException("Media file was not found.");

    private static async Task<byte[]> ReadFileAsync(Microsoft.AspNetCore.Http.IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        await using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);
        return memory.ToArray();
    }

    private static void ValidateUploadRequest(Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file is null || file.Length == 0)
        {
            throw new InvalidOperationException("A file is required.");
        }
    }

    private static void ValidateFile(string? contentType, string extension, long fileSize)
    {
        if (fileSize <= 0 || fileSize > MaxFileSizeBytes)
        {
            throw new InvalidOperationException("File exceeds the allowed size.");
        }

        if (!AllowedMimeTypes.TryGetValue(extension, out var mimeTypes))
        {
            throw new InvalidOperationException("File type is not supported.");
        }

        var normalizedMimeType = NormalizeMimeType(contentType, extension);
        if (mimeTypes.Length > 0 && !mimeTypes.Contains(normalizedMimeType, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("The uploaded file MIME type is not allowed.");
        }
    }

    private static string NormalizeMimeType(string? contentType, string extension)
    {
        if (string.IsNullOrWhiteSpace(contentType) || contentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase))
        {
            return AllowedMimeTypes[extension][0];
        }

        return contentType.Trim();
    }

    private static string ResolveDefaultFolderPath(string? module, string extension)
    {
        var normalized = module?.Trim().ToLowerInvariant() ?? string.Empty;
        return normalized switch
        {
            "products" => "products",
            "vendors" => "vendors",
            "company" => "cms",
            "cms" => "cms",
            "users" => "users",
            "shipping" or "documents" => "documents",
            _ => ImageExtensions.Contains(extension) ? "products" : "documents"
        };
    }

    private static string Slugify(string value)
        => string.Concat(value.Trim().ToLowerInvariant().Select(character => char.IsLetterOrDigit(character) ? character : '-'))
            .Trim('-')
            .Replace("--", "-", StringComparison.Ordinal);

    private static void ValidateUsageRequest(MediaUsageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Module)
            || string.IsNullOrWhiteSpace(request.EntityId)
            || string.IsNullOrWhiteSpace(request.EntityType)
            || string.IsNullOrWhiteSpace(request.UsageType))
        {
            throw new InvalidOperationException("Usage module, entity, entity type, and usage type are required.");
        }
    }

    private static MediaFileResponse MapFile(MediaFile entity)
        => new()
        {
            Id = entity.Id,
            FileName = entity.FileName,
            OriginalFileName = entity.OriginalFileName,
            FilePath = entity.FilePath,
            FileUrl = entity.FileUrl,
            FileSize = entity.FileSize,
            MimeType = entity.MimeType,
            Extension = entity.Extension,
            StorageProvider = entity.StorageProvider,
            FolderId = entity.FolderId,
            FolderName = entity.Folder?.Name ?? string.Empty,
            UploadedByUserId = entity.UploadedByUserId,
            UploadedByUsername = entity.UploadedByUser?.Username ?? string.Empty,
            Checksum = entity.Checksum,
            IsDeleted = entity.IsDeleted,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            ThumbnailUrl = BuildDerivedUrl(entity, "thumbnail"),
            MediumUrl = BuildDerivedUrl(entity, "medium"),
            LargeUrl = BuildDerivedUrl(entity, "large"),
            Usage = entity.UsageEntries
                .OrderBy(x => x.CreatedAt)
                .Select(x => new MediaUsageResponse
                {
                    Id = x.Id,
                    Module = x.Module,
                    EntityId = x.EntityId,
                    EntityType = x.EntityType,
                    UsageType = x.UsageType,
                    CreatedAt = x.CreatedAt
                })
                .ToList()
        };

    private static string BuildDerivedUrl(MediaFile entity, string profile)
    {
        if (!ThumbnailCapableExtensions.Contains($".{entity.Extension}"))
        {
            return string.Empty;
        }

        var relativeFolder = entity.FilePath.Replace("uploads/media/", string.Empty, StringComparison.OrdinalIgnoreCase);
        var segments = relativeFolder.Split('/');
        if (segments.Length < 2)
        {
            return string.Empty;
        }

        var folderPath = string.Join("/", segments[..^1]);
        return $"/uploads/media/thumbnails/{profile}/{folderPath}/{entity.FileName}";
    }

    private async Task WriteAuditLogAsync(Guid? userId, string action, string entityType, string? entityId, string ipAddress, CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Module = "Media",
            OldValues = string.Empty,
            NewValues = string.Empty,
            IpAddress = ipAddress,
            UserAgent = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

namespace cxserver.Modules.Media.Services;

public sealed class StoredMediaFile
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string MediumUrl { get; set; } = string.Empty;
    public string LargeUrl { get; set; } = string.Empty;
}

public interface IFileStorageProvider
{
    string ProviderName { get; }
    Task<StoredMediaFile> SaveFileAsync(string relativeFolderPath, string extension, byte[] content, bool isImage, bool supportsThumbnailGeneration, CancellationToken cancellationToken);
    Task<StoredMediaFile> MoveFileAsync(StoredMediaFile file, string targetRelativeFolderPath, CancellationToken cancellationToken);
}

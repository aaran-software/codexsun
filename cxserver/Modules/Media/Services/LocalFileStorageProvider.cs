using System.IO;
using Microsoft.Extensions.Hosting;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace cxserver.Modules.Media.Services;

public sealed class LocalFileStorageProvider(IHostEnvironment environment) : IFileStorageProvider
{
    private static readonly (string Name, int Width)[] ThumbnailProfiles =
    [
        ("thumbnail", 160),
        ("medium", 640),
        ("large", 1280)
    ];

    public string ProviderName => "Local";

    public async Task<StoredMediaFile> SaveFileAsync(string relativeFolderPath, string extension, byte[] content, bool isImage, bool supportsThumbnailGeneration, CancellationToken cancellationToken)
    {
        var normalizedFolderPath = NormalizePath(relativeFolderPath);
        var fileName = $"{Guid.NewGuid():N}.{extension.TrimStart('.').ToLowerInvariant()}";
        var filePath = Path.Combine(GetMediaRoot(), normalizedFolderPath.Replace('/', Path.DirectorySeparatorChar), fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        await File.WriteAllBytesAsync(filePath, content, cancellationToken);

        var stored = new StoredMediaFile
        {
            FileName = fileName,
            FilePath = NormalizePath(Path.Combine("uploads", "media", normalizedFolderPath, fileName)),
            FileUrl = $"/{NormalizePath(Path.Combine("uploads", "media", normalizedFolderPath, fileName))}"
        };

        if (isImage && supportsThumbnailGeneration)
        {
            await GenerateThumbnailsAsync(normalizedFolderPath, fileName, extension, content, stored, cancellationToken);
        }

        return stored;
    }

    public async Task<StoredMediaFile> MoveFileAsync(StoredMediaFile file, string targetRelativeFolderPath, CancellationToken cancellationToken)
    {
        var normalizedTarget = NormalizePath(targetRelativeFolderPath);
        var currentPhysicalPath = Path.Combine(environment.ContentRootPath, file.FilePath.Replace('/', Path.DirectorySeparatorChar));
        var targetPhysicalPath = Path.Combine(GetMediaRoot(), normalizedTarget.Replace('/', Path.DirectorySeparatorChar), file.FileName);
        Directory.CreateDirectory(Path.GetDirectoryName(targetPhysicalPath)!);

        if (File.Exists(currentPhysicalPath))
        {
            File.Move(currentPhysicalPath, targetPhysicalPath, overwrite: true);
        }

        var moved = new StoredMediaFile
        {
            FileName = file.FileName,
            FilePath = NormalizePath(Path.Combine("uploads", "media", normalizedTarget, file.FileName)),
            FileUrl = $"/{NormalizePath(Path.Combine("uploads", "media", normalizedTarget, file.FileName))}",
            ThumbnailUrl = file.ThumbnailUrl,
            MediumUrl = file.MediumUrl,
            LargeUrl = file.LargeUrl
        };

        await Task.CompletedTask;
        return moved;
    }

    private async Task GenerateThumbnailsAsync(string relativeFolderPath, string fileName, string extension, byte[] content, StoredMediaFile stored, CancellationToken cancellationToken)
    {
        await using var stream = new MemoryStream(content, writable: false);
        using var image = await Image.LoadAsync(stream, cancellationToken);
        foreach (var (profileName, width) in ThumbnailProfiles)
        {
            using var clone = image.Clone(context => context.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(width, width)
            }));

            var relativeThumbnailPath = NormalizePath(Path.Combine("uploads", "media", "thumbnails", profileName, relativeFolderPath, fileName));
            var physicalThumbnailPath = Path.Combine(environment.ContentRootPath, relativeThumbnailPath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(physicalThumbnailPath)!);
            await clone.SaveAsync(physicalThumbnailPath, GetEncoder(extension), cancellationToken);

            var url = $"/{relativeThumbnailPath}";
            switch (profileName)
            {
                case "thumbnail":
                    stored.ThumbnailUrl = url;
                    break;
                case "medium":
                    stored.MediumUrl = url;
                    break;
                case "large":
                    stored.LargeUrl = url;
                    break;
            }
        }
    }

    private static IImageEncoder GetEncoder(string extension)
        => extension.TrimStart('.').ToLowerInvariant() switch
        {
            "jpg" or "jpeg" => new JpegEncoder(),
            "png" => new PngEncoder(),
            "webp" => new WebpEncoder(),
            _ => new PngEncoder()
        };

    private string GetMediaRoot() => Path.Combine(environment.ContentRootPath, "uploads", "media");

    private static string NormalizePath(string path)
        => path.Replace('\\', '/').Trim('/').ToLowerInvariant();
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using cxserver.Modules.Media.Entities;

namespace cxserver.Modules.Media.Configurations;

internal static class MediaConfigurationExtensions
{
    public static void ConfigureMedia<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : MediaEntity
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
    }
}

internal static class MediaSeedData
{
    internal static readonly DateTimeOffset CreatedAt = new(2026, 03, 15, 0, 0, 0, TimeSpan.Zero);

    internal static readonly MediaFolder[] Folders =
    [
        new() { Id = 1, Name = "Products", Path = "products", CreatedAt = CreatedAt, UpdatedAt = CreatedAt },
        new() { Id = 2, Name = "Vendors", Path = "vendors", CreatedAt = CreatedAt, UpdatedAt = CreatedAt },
        new() { Id = 3, Name = "CMS", Path = "cms", CreatedAt = CreatedAt, UpdatedAt = CreatedAt },
        new() { Id = 4, Name = "Users", Path = "users", CreatedAt = CreatedAt, UpdatedAt = CreatedAt },
        new() { Id = 5, Name = "Documents", Path = "documents", CreatedAt = CreatedAt, UpdatedAt = CreatedAt }
    ];
}

public sealed class MediaFolderConfiguration : IEntityTypeConfiguration<MediaFolder>
{
    public void Configure(EntityTypeBuilder<MediaFolder> builder)
    {
        builder.ToTable("media_folders");
        builder.ConfigureMedia();
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Path).HasMaxLength(256).IsRequired();
        builder.HasIndex(x => x.Path).IsUnique();
        builder.HasOne(x => x.ParentFolder).WithMany(x => x.ChildFolders).HasForeignKey(x => x.ParentFolderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasData(MediaSeedData.Folders);
    }
}

public sealed class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
{
    public void Configure(EntityTypeBuilder<MediaFile> builder)
    {
        builder.ToTable("media_files");
        builder.ConfigureMedia();
        builder.Property(x => x.FileName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.OriginalFileName).HasMaxLength(256).IsRequired();
        builder.Property(x => x.FilePath).HasMaxLength(512).IsRequired();
        builder.Property(x => x.FileUrl).HasMaxLength(512).IsRequired();
        builder.Property(x => x.MimeType).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Extension).HasMaxLength(32).IsRequired();
        builder.Property(x => x.StorageProvider).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Checksum).HasMaxLength(128).IsRequired();
        builder.HasIndex(x => x.Checksum);
        builder.HasIndex(x => new { x.FolderId, x.CreatedAt });
        builder.HasIndex(x => x.IsDeleted);
        builder.HasOne(x => x.Folder).WithMany(x => x.Files).HasForeignKey(x => x.FolderId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.UploadedByUser).WithMany().HasForeignKey(x => x.UploadedByUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class MediaUsageConfiguration : IEntityTypeConfiguration<MediaUsage>
{
    public void Configure(EntityTypeBuilder<MediaUsage> builder)
    {
        builder.ToTable("media_usage");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Module).HasMaxLength(64).IsRequired();
        builder.Property(x => x.EntityId).HasMaxLength(128).IsRequired();
        builder.Property(x => x.EntityType).HasMaxLength(128).IsRequired();
        builder.Property(x => x.UsageType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.HasIndex(x => new { x.MediaFileId, x.Module, x.EntityId, x.UsageType }).IsUnique();
        builder.HasOne(x => x.MediaFile).WithMany(x => x.UsageEntries).HasForeignKey(x => x.MediaFileId).OnDelete(DeleteBehavior.Cascade);
    }
}

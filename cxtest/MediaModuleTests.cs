using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using cxtest.AuthSecurityTests;

namespace cxtest;

public sealed class MediaModuleTests
{
    [Fact]
    public async Task Admin_can_create_folder_upload_delete_and_restore_media_file()
    {
        using var factory = AuthSecurityTestSupport.CreateFactory();
        using var client = CreateAdminClient(factory);

        var createFolderResponse = await client.PostAsJsonAsync("/media/folders", new
        {
            name = $"Tests-{Guid.NewGuid():N}"[..12]
        });
        createFolderResponse.EnsureSuccessStatusCode();
        var folder = await AuthSecurityTestSupport.ReadRequiredAsync<MediaFolderEnvelope>(createFolderResponse);

        using var uploadContent = new MultipartFormDataContent();
        var imageBytes = System.Text.Encoding.UTF8.GetBytes("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"><rect width=\"10\" height=\"10\" fill=\"#3366ff\"/></svg>");
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/svg+xml");
        uploadContent.Add(fileContent, "file", "pixel.svg");
        uploadContent.Add(new StringContent(folder.Id.ToString()), "folderId");
        uploadContent.Add(new StringContent("products"), "module");
        uploadContent.Add(new StringContent("Product"), "entityType");
        uploadContent.Add(new StringContent("1"), "entityId");
        uploadContent.Add(new StringContent("product image"), "usageType");

        var uploadResponse = await client.PostAsync("/media/upload", uploadContent);
        uploadResponse.EnsureSuccessStatusCode();
        var uploaded = await AuthSecurityTestSupport.ReadRequiredAsync<MediaFileEnvelope>(uploadResponse);

        Assert.Equal(folder.Id, uploaded.FolderId);
        Assert.False(string.IsNullOrWhiteSpace(uploaded.FileUrl));
        Assert.Single(uploaded.Usage);

        var deleteResponse = await client.DeleteAsync($"/media/files/{uploaded.Id}");
        deleteResponse.EnsureSuccessStatusCode();

        var deletedState = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.MediaFiles.AsNoTracking().SingleAsync(x => x.Id == uploaded.Id));
        Assert.True(deletedState.IsDeleted);

        var restoreResponse = await client.PostAsync($"/media/files/{uploaded.Id}/restore", content: null);
        restoreResponse.EnsureSuccessStatusCode();

        var restoredState = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.MediaFiles.AsNoTracking().SingleAsync(x => x.Id == uploaded.Id));
        Assert.False(restoredState.IsDeleted);

        var logs = await AuthSecurityTestSupport.WithDbContextAsync(factory, async dbContext =>
            await dbContext.AuditLogs
                .Where(x => x.EntityType == "MediaFile" || x.EntityType == "MediaFolder")
                .Select(x => x.Action)
                .ToListAsync());

        Assert.Contains("Media.Upload", logs);
        Assert.Contains("Media.Delete", logs);
        Assert.Contains("Media.Restore", logs);
        Assert.Contains("Media.CreateFolder", logs);
    }

    private static HttpClient CreateAdminClient(Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> factory)
    {
        var client = AuthSecurityTestSupport.CreateClient(factory);
        var settings = AuthSecurityTestSupport.GetJwtSettings(factory);
        var token = AuthSecurityTestSupport.CreateSignedJwt(
            settings,
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "sundar",
            "Admin",
            ["User.Read"],
            DateTimeOffset.UtcNow.AddMinutes(30));

        AuthSecurityTestSupport.SetBearerToken(client, token);
        return client;
    }

    private sealed class MediaFolderEnvelope
    {
        public int Id { get; set; }
    }

    private sealed class MediaUsageEnvelope
    {
        public int Id { get; set; }
    }

    private sealed class MediaFileEnvelope
    {
        public int Id { get; set; }
        public int? FolderId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public List<MediaUsageEnvelope> Usage { get; set; } = [];
    }
}

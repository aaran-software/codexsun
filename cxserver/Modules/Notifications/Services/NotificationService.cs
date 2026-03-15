using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using cxserver.Infrastructure;
using cxserver.Modules.Notifications.Configurations;
using cxserver.Modules.Notifications.DTOs;
using cxserver.Modules.Notifications.Entities;
using cxserver.Modules.Notifications.Providers;
using cxserver.Modules.System.Entities;

namespace cxserver.Modules.Notifications.Services;

public sealed class NotificationService(
    CodexsunDbContext dbContext,
    IEnumerable<INotificationProvider> providers)
{
    private static readonly string[] SupportedChannels = ["Email", "SMS", "WhatsApp", "InApp"];

    public async Task<IReadOnlyList<NotificationTemplateResponse>> GetTemplatesAsync(CancellationToken cancellationToken)
        => await dbContext.NotificationTemplates.AsNoTracking()
            .OrderBy(x => x.Code)
            .ThenBy(x => x.Channel)
            .Select(x => new NotificationTemplateResponse
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                Channel = x.Channel,
                Subject = x.Subject,
                TemplateBody = x.TemplateBody,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task<NotificationTemplateResponse> CreateTemplateAsync(NotificationTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateTemplateRequest(request);
        var exists = await dbContext.NotificationTemplates.AnyAsync(
            x => x.Code == request.Code.Trim() && x.Channel == request.Channel.Trim(),
            cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException("A notification template already exists for this code and channel.");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new NotificationTemplate
        {
            Code = request.Code.Trim(),
            Name = request.Name.Trim(),
            Channel = request.Channel.Trim(),
            Subject = request.Subject.Trim(),
            TemplateBody = request.TemplateBody.Trim(),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.NotificationTemplates.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await GetTemplatesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<NotificationTemplateResponse?> UpdateTemplateAsync(int id, NotificationTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        ValidateTemplateRequest(request);
        var entity = await dbContext.NotificationTemplates.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var duplicate = await dbContext.NotificationTemplates.AnyAsync(
            x => x.Id != id && x.Code == request.Code.Trim() && x.Channel == request.Channel.Trim(),
            cancellationToken);

        if (duplicate)
        {
            throw new InvalidOperationException("A notification template already exists for this code and channel.");
        }

        entity.Code = request.Code.Trim();
        entity.Name = request.Name.Trim();
        entity.Channel = request.Channel.Trim();
        entity.Subject = request.Subject.Trim();
        entity.TemplateBody = request.TemplateBody.Trim();
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return (await GetTemplatesAsync(cancellationToken)).Single(x => x.Id == entity.Id);
    }

    public async Task<IReadOnlyList<NotificationLogResponse>> GetLogsAsync(CancellationToken cancellationToken)
        => await dbContext.NotificationLogs.AsNoTracking()
            .Include(x => x.Notification).ThenInclude(x => x.Template)
            .Include(x => x.Notification).ThenInclude(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .Take(500)
            .Select(x => new NotificationLogResponse
            {
                Id = x.Id,
                NotificationId = x.NotificationId,
                TemplateCode = x.Notification.Template.Code,
                Username = x.Notification.User.Username,
                Channel = x.Notification.Channel,
                Status = x.Status,
                ProviderResponse = x.ProviderResponse,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

    public async Task<NotificationSettingsResponse> GetSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await LoadSettingsMapAsync(cancellationToken);
        return new NotificationSettingsResponse
        {
            EmailEnabled = GetBooleanSetting(settings, "notifications.email.enabled", true),
            SmsEnabled = GetBooleanSetting(settings, "notifications.sms.enabled", true),
            WhatsAppEnabled = GetBooleanSetting(settings, "notifications.whatsapp.enabled", true),
            InAppEnabled = GetBooleanSetting(settings, "notifications.inapp.enabled", true),
            BatchSize = GetIntSetting(settings, "notifications.batch-size", 25),
            PendingCount = await dbContext.Notifications.CountAsync(x => x.Status == "Pending", cancellationToken),
            SentCount = await dbContext.Notifications.CountAsync(x => x.Status == "Sent", cancellationToken),
            FailedCount = await dbContext.Notifications.CountAsync(x => x.Status == "Failed", cancellationToken),
            SupportedChannels = SupportedChannels,
            RegisteredProviders = providers.Select(x => x.Channel).OrderBy(x => x).ToArray()
        };
    }

    public async Task<NotificationSettingsResponse> UpdateSettingsAsync(NotificationSettingsUpdateRequest request, CancellationToken cancellationToken)
    {
        var normalizedBatchSize = Math.Max(1, request.BatchSize);
        await UpsertSettingAsync("notifications.email.enabled", request.EmailEnabled.ToString(), "Toggle email notifications.", cancellationToken);
        await UpsertSettingAsync("notifications.sms.enabled", request.SmsEnabled.ToString(), "Toggle SMS notifications.", cancellationToken);
        await UpsertSettingAsync("notifications.whatsapp.enabled", request.WhatsAppEnabled.ToString(), "Toggle WhatsApp notifications.", cancellationToken);
        await UpsertSettingAsync("notifications.inapp.enabled", request.InAppEnabled.ToString(), "Toggle in-app notifications.", cancellationToken);
        await UpsertSettingAsync("notifications.batch-size", normalizedBatchSize.ToString(), "Notification queue batch size.", cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetSettingsAsync(cancellationToken);
    }

    public async Task<int> QueueNotificationAsync(QueueNotificationRequest request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty)
        {
            return 0;
        }

        var templates = await dbContext.NotificationTemplates
            .Where(x => x.Code == request.TemplateCode.Trim() && x.IsActive)
            .ToListAsync(cancellationToken);

        if (templates.Count == 0)
        {
            return 0;
        }

        var now = DateTimeOffset.UtcNow;
        var payloadJson = JsonSerializer.Serialize(request.Payload);
        foreach (var template in templates)
        {
            dbContext.Notifications.Add(new Notification
            {
                TemplateId = template.Id,
                UserId = request.UserId,
                Channel = template.Channel,
                Status = "Pending",
                PayloadJson = payloadJson,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        return await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<int> QueueEventAsync(string templateCode, Guid? userId, Dictionary<string, string> payload, CancellationToken cancellationToken)
        => !userId.HasValue || userId.Value == Guid.Empty
            ? Task.FromResult(0)
            : QueueNotificationAsync(new QueueNotificationRequest
            {
                TemplateCode = templateCode,
                UserId = userId.Value,
                Payload = payload
            }, cancellationToken);

    public Task<int> SendEmailAsync(Guid userId, string templateCode, Dictionary<string, string> payload, CancellationToken cancellationToken)
        => QueueNotificationAsync(new QueueNotificationRequest { TemplateCode = templateCode, UserId = userId, Payload = payload }, cancellationToken);

    public Task<int> SendSmsAsync(Guid userId, string templateCode, Dictionary<string, string> payload, CancellationToken cancellationToken)
        => QueueNotificationAsync(new QueueNotificationRequest { TemplateCode = templateCode, UserId = userId, Payload = payload }, cancellationToken);

    public Task<int> SendWhatsAppAsync(Guid userId, string templateCode, Dictionary<string, string> payload, CancellationToken cancellationToken)
        => QueueNotificationAsync(new QueueNotificationRequest { TemplateCode = templateCode, UserId = userId, Payload = payload }, cancellationToken);

    public Task<int> SendInAppNotificationAsync(Guid userId, string templateCode, Dictionary<string, string> payload, CancellationToken cancellationToken)
        => QueueNotificationAsync(new QueueNotificationRequest { TemplateCode = templateCode, UserId = userId, Payload = payload }, cancellationToken);

    public async Task<int> ProcessNotificationQueueAsync(CancellationToken cancellationToken)
    {
        var settings = await GetSettingsAsync(cancellationToken);
        var pending = await dbContext.Notifications
            .Include(x => x.Template)
            .Include(x => x.User)
            .Where(x => x.Status == "Pending")
            .OrderBy(x => x.CreatedAt)
            .Take(settings.BatchSize)
            .ToListAsync(cancellationToken);

        var processed = 0;
        foreach (var notification in pending)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var channelEnabled = notification.Channel switch
            {
                "Email" => settings.EmailEnabled,
                "SMS" => settings.SmsEnabled,
                "WhatsApp" => settings.WhatsAppEnabled,
                "InApp" => settings.InAppEnabled,
                _ => false
            };

            if (!channelEnabled)
            {
                notification.Status = "Skipped";
                notification.UpdatedAt = DateTimeOffset.UtcNow;
                dbContext.NotificationLogs.Add(new NotificationLog
                {
                    NotificationId = notification.Id,
                    ProviderResponse = $"Channel {notification.Channel} is disabled.",
                    Status = "Skipped",
                    CreatedAt = notification.UpdatedAt,
                    UpdatedAt = notification.UpdatedAt
                });
                processed++;
                continue;
            }

            var payload = DeserializePayload(notification.PayloadJson);
            var subject = RenderTemplate(notification.Template.Subject, payload);
            var body = RenderTemplate(notification.Template.TemplateBody, payload);

            try
            {
                string providerResponse;
                if (notification.Channel == "InApp")
                {
                    providerResponse = "In-app notification stored.";
                }
                else
                {
                    var provider = providers.SingleOrDefault(x => x.Channel == notification.Channel)
                        ?? throw new InvalidOperationException($"No provider registered for channel {notification.Channel}.");
                    providerResponse = await provider.SendAsync(notification, subject, body, cancellationToken);
                }

                notification.Status = "Sent";
                notification.SentAt = DateTimeOffset.UtcNow;
                notification.UpdatedAt = notification.SentAt.Value;
                dbContext.NotificationLogs.Add(new NotificationLog
                {
                    NotificationId = notification.Id,
                    ProviderResponse = providerResponse,
                    Status = "Sent",
                    CreatedAt = notification.UpdatedAt,
                    UpdatedAt = notification.UpdatedAt
                });
            }
            catch (Exception exception)
            {
                notification.Status = "Failed";
                notification.UpdatedAt = DateTimeOffset.UtcNow;
                dbContext.NotificationLogs.Add(new NotificationLog
                {
                    NotificationId = notification.Id,
                    ProviderResponse = exception.Message,
                    Status = "Failed",
                    CreatedAt = notification.UpdatedAt,
                    UpdatedAt = notification.UpdatedAt
                });
            }

            processed++;
        }

        if (processed > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return processed;
    }

    public async Task QueueLowInventoryAlertAsync(int productId, string productName, int warehouseId, string warehouseName, int quantityOnHand, int reorderLevel, CancellationToken cancellationToken)
    {
        if (quantityOnHand > reorderLevel)
        {
            return;
        }

        var adminUserIds = await dbContext.Users
            .Where(x => !x.IsDeleted && x.Status == "Active" && x.Role.Name == "Admin")
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var adminUserId in adminUserIds)
        {
            await QueueEventAsync(NotificationTemplateCatalog.LowInventoryAlert, adminUserId, new Dictionary<string, string>
            {
                ["ProductId"] = productId.ToString(),
                ["ProductName"] = productName,
                ["WarehouseId"] = warehouseId.ToString(),
                ["WarehouseName"] = warehouseName,
                ["QuantityOnHand"] = quantityOnHand.ToString(),
                ["ReorderLevel"] = reorderLevel.ToString()
            }, cancellationToken);
        }
    }

    private static void ValidateTemplateRequest(NotificationTemplateUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code)
            || string.IsNullOrWhiteSpace(request.Name)
            || string.IsNullOrWhiteSpace(request.Channel)
            || string.IsNullOrWhiteSpace(request.Subject)
            || string.IsNullOrWhiteSpace(request.TemplateBody))
        {
            throw new InvalidOperationException("Template code, name, channel, subject, and body are required.");
        }

        if (!SupportedChannels.Contains(request.Channel.Trim()))
        {
            throw new InvalidOperationException("Unsupported notification channel.");
        }
    }

    private async Task<Dictionary<string, string>> LoadSettingsMapAsync(CancellationToken cancellationToken)
        => await dbContext.SystemSettings.AsNoTracking()
            .Where(x => x.Key.StartsWith("notifications."))
            .ToDictionaryAsync(x => x.Key, x => x.Value, cancellationToken);

    private async Task UpsertSettingAsync(string key, string value, string description, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SystemSettings.SingleOrDefaultAsync(x => x.Key == key, cancellationToken);
        if (entity is null)
        {
            dbContext.SystemSettings.Add(new SystemSetting
            {
                Key = key,
                Value = value,
                Description = description,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });
            return;
        }

        entity.Value = value;
        entity.Description = description;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    private static bool GetBooleanSetting(IReadOnlyDictionary<string, string> settings, string key, bool fallback)
        => settings.TryGetValue(key, out var raw) && bool.TryParse(raw, out var parsed) ? parsed : fallback;

    private static int GetIntSetting(IReadOnlyDictionary<string, string> settings, string key, int fallback)
        => settings.TryGetValue(key, out var raw) && int.TryParse(raw, out var parsed) ? parsed : fallback;

    private static Dictionary<string, string> DeserializePayload(string payloadJson)
        => JsonSerializer.Deserialize<Dictionary<string, string>>(payloadJson) ?? [];

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> payload)
    {
        var rendered = template;
        foreach (var pair in payload)
        {
            rendered = rendered.Replace($"{{{{{pair.Key}}}}}", pair.Value, StringComparison.OrdinalIgnoreCase);
        }

        return rendered;
    }
}

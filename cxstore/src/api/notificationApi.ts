import { requestJson } from "@/api/httpClient"
import type {
  NotificationLog,
  NotificationSettings,
  NotificationSettingsUpdateRequest,
  NotificationTemplate,
  NotificationTemplateUpsertRequest,
} from "@/types/notification"

export function getNotificationTemplates() {
  return requestJson<NotificationTemplate[]>("/notifications/templates", { method: "GET" })
}

export function createNotificationTemplate(request: NotificationTemplateUpsertRequest) {
  return requestJson<NotificationTemplate>("/notifications/templates", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateNotificationTemplate(id: number, request: NotificationTemplateUpsertRequest) {
  return requestJson<NotificationTemplate>(`/notifications/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function getNotificationLogs() {
  return requestJson<NotificationLog[]>("/notifications/logs", { method: "GET" })
}

export function getNotificationSettings() {
  return requestJson<NotificationSettings>("/notifications/settings", { method: "GET" })
}

export function updateNotificationSettings(request: NotificationSettingsUpdateRequest) {
  return requestJson<NotificationSettings>("/notifications/settings", {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function processNotificationQueue() {
  return requestJson<{ processed: number }>("/notifications/settings/process", {
    method: "POST",
  })
}

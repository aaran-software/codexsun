export type NotificationChannel = "Email" | "SMS" | "WhatsApp" | "InApp"

export interface NotificationTemplate {
  id: number
  code: string
  name: string
  channel: NotificationChannel
  subject: string
  templateBody: string
  isActive: boolean
  createdAt: string
}

export interface NotificationTemplateUpsertRequest {
  code: string
  name: string
  channel: NotificationChannel
  subject: string
  templateBody: string
  isActive: boolean
}

export interface NotificationLog {
  id: number
  notificationId: number
  templateCode: string
  username: string
  channel: NotificationChannel
  status: string
  providerResponse: string
  createdAt: string
}

export interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  whatsAppEnabled: boolean
  inAppEnabled: boolean
  batchSize: number
  pendingCount: number
  sentCount: number
  failedCount: number
  supportedChannels: string[]
  registeredProviders: string[]
}

export interface NotificationSettingsUpdateRequest {
  emailEnabled: boolean
  smsEnabled: boolean
  whatsAppEnabled: boolean
  inAppEnabled: boolean
  batchSize: number
}

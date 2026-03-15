export interface AuditLogEntry {
  id: string
  userId?: string | null
  username: string
  email: string
  action: string
  entityType: string
  entityId: string
  module: string
  oldValues: string
  newValues: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface SystemLogEntry {
  id: string
  service: string
  eventType: string
  message: string
  details: string
  severity: string
  createdAt: string
}

export interface ErrorLogEntry {
  id: string
  service: string
  exceptionMessage: string
  stackTrace: string
  source: string
  path: string
  userId?: string | null
  username: string
  email: string
  ipAddress: string
  createdAt: string
}

export interface LoginHistoryEntry {
  id: string
  userId?: string | null
  username: string
  email: string
  ipAddress: string
  device: string
  browser: string
  os: string
  loginStatus: string
  loginTime: string
  logoutTime?: string | null
}

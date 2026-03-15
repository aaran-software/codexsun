import { requestJson } from "@/api/httpClient"
import type { AuditLogEntry, ErrorLogEntry, LoginHistoryEntry, SystemLogEntry } from "@/types/monitoring"

type QueryValue = string | number | boolean | null | undefined

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams()

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

export function getAuditLogs(query?: Record<string, QueryValue>) {
  return requestJson<AuditLogEntry[]>(buildUrl("/api/admin/monitoring/audit-logs", query), { method: "GET" })
}

export function getSystemLogs(query?: Record<string, QueryValue>) {
  return requestJson<SystemLogEntry[]>(buildUrl("/api/admin/monitoring/system-logs", query), { method: "GET" })
}

export function getErrorLogs(query?: Record<string, QueryValue>) {
  return requestJson<ErrorLogEntry[]>(buildUrl("/api/admin/monitoring/error-logs", query), { method: "GET" })
}

export function getLoginHistory(query?: Record<string, QueryValue>) {
  return requestJson<LoginHistoryEntry[]>(buildUrl("/api/admin/monitoring/login-history", query), { method: "GET" })
}

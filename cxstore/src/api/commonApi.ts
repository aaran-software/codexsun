import { requestJson } from "@/api/httpClient"
import type { CommonMasterItem, CommonSearchItem } from "@/types/common"

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

export function listCommonItems(path: string, query?: Record<string, QueryValue>) {
  return requestJson<CommonMasterItem[]>(buildUrl(path, query), { method: "GET" })
}

export async function getCommonItemById(path: string, id: number, query?: Record<string, QueryValue>) {
  const items = await listCommonItems(path, query)
  return items.find((item) => item.id === id) ?? null
}

export function searchCommonItems(path: string, query?: Record<string, QueryValue>) {
  return requestJson<CommonSearchItem[]>(buildUrl(`${path}/search`, query), { method: "GET" })
}

export function createCommonItem<TRequest>(path: string, request: TRequest) {
  return requestJson<CommonMasterItem>(path, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateCommonItem<TRequest>(path: string, id: number, request: TRequest) {
  return requestJson<CommonMasterItem>(`${path}/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function activateCommonItem(path: string, id: number) {
  return requestJson<void>(`${path}/${id}/activate`, {
    method: "POST",
  })
}

export function deactivateCommonItem(path: string, id: number) {
  return requestJson<void>(`${path}/${id}/deactivate`, {
    method: "POST",
  })
}

import { requestJson } from "@/api/httpClient"
import type { MediaFile, MediaFolder, MediaFolderCreateRequest, MediaUploadRequest } from "@/types/media"

export function getMediaFiles(search?: string, folderId?: number | null, includeDeleted = false) {
  const params = new URLSearchParams()
  if (search) {
    params.set("search", search)
  }
  if (folderId) {
    params.set("folderId", String(folderId))
  }
  if (includeDeleted) {
    params.set("includeDeleted", "true")
  }

  const query = params.toString()
  return requestJson<MediaFile[]>(`/media/files${query ? `?${query}` : ""}`, { method: "GET" })
}

export function getMediaFile(id: number) {
  return requestJson<MediaFile>(`/media/files/${id}`, { method: "GET" })
}

export function uploadMedia(request: MediaUploadRequest) {
  const formData = new FormData()
  formData.append("file", request.file)
  if (request.folderId) {
    formData.append("folderId", String(request.folderId))
  }
  if (request.module) {
    formData.append("module", request.module)
  }
  if (request.entityId) {
    formData.append("entityId", request.entityId)
  }
  if (request.entityType) {
    formData.append("entityType", request.entityType)
  }
  if (request.usageType) {
    formData.append("usageType", request.usageType)
  }

  return requestJson<MediaFile>("/media/upload", {
    method: "POST",
    body: formData,
  })
}

export function deleteMediaFile(id: number) {
  return requestJson<void>(`/media/files/${id}`, { method: "DELETE" })
}

export function restoreMediaFile(id: number) {
  return requestJson<void>(`/media/files/${id}/restore`, { method: "POST" })
}

export function renameMediaFile(id: number, name: string) {
  return requestJson<MediaFile>(`/media/files/${id}/rename`, {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export function getMediaFolders() {
  return requestJson<MediaFolder[]>("/media/folders", { method: "GET" })
}

export function createMediaFolder(request: MediaFolderCreateRequest) {
  return requestJson<MediaFolder>("/media/folders", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function deleteMediaFolder(id: number) {
  return requestJson<void>(`/media/folders/${id}`, { method: "DELETE" })
}

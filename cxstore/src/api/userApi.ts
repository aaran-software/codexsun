import { requestJson } from "@/api/httpClient"
import type { AdminUserDetail, AdminUserSummary, CreateUserRequest, UpdateUserRequest } from "@/types/admin"

export function getUsers() {
  return requestJson<AdminUserSummary[]>("/auth/users", { method: "GET" })
}

export function getUserById(id: string) {
  return requestJson<AdminUserDetail>(`/auth/users/${id}`, { method: "GET" })
}

export function createUser(request: CreateUserRequest) {
  return requestJson<AdminUserDetail>("/auth/users", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateUser(id: string, request: UpdateUserRequest) {
  return requestJson<AdminUserDetail>(`/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function deleteUser(id: string) {
  return requestJson<void>(`/auth/users/${id}`, {
    method: "DELETE",
  })
}

export function restoreUser(id: string) {
  return requestJson<void>(`/auth/users/${id}/restore`, {
    method: "POST",
  })
}

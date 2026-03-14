import { requestJson } from "@/api/httpClient"
import type { CreateRoleRequest, PermissionItem, RoleDetail, RoleSummary, UpdateRoleRequest } from "@/types/admin"

export function getRoles() {
  return requestJson<RoleSummary[]>("/auth/roles", { method: "GET" })
}

export function getRoleById(id: string) {
  return requestJson<RoleDetail>(`/auth/roles/${id}`, { method: "GET" })
}

export function createRole(request: CreateRoleRequest) {
  return requestJson<RoleDetail>("/auth/roles", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function updateRole(id: string, request: UpdateRoleRequest) {
  return requestJson<RoleDetail>(`/auth/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

export function getPermissions() {
  return requestJson<PermissionItem[]>("/auth/permissions", { method: "GET" })
}

export function getRolePermissions(roleId: string) {
  return requestJson<string[]>(`/auth/roles/${roleId}/permissions`, { method: "GET" })
}

export function updateRolePermissions(roleId: string, permissionIds: string[]) {
  return requestJson<void>(`/auth/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds }),
  })
}

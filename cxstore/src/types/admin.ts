export interface AdminUserSummary {
  id: string
  username: string
  email: string
  role: string
  status: string
  isDeleted: boolean
  createdAt: string
}

export interface AdminUserDetail {
  id: string
  username: string
  email: string
  roleId: string
  role: string
  status: string
  isDeleted: boolean
  createdAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  roleId: string
}

export interface UpdateUserRequest {
  email: string
  roleId: string
  password?: string
  status: string
}

export interface RoleSummary {
  id: string
  name: string
  description: string
  userCount: number
}

export interface RoleDetail {
  id: string
  name: string
  description: string
}

export interface CreateRoleRequest {
  name: string
  description: string
}

export interface UpdateRoleRequest {
  name: string
  description: string
}

export interface PermissionItem {
  id: string
  code: string
  description: string
}

export type AuthRole = "Admin" | "Vendor" | "Customer" | "Staff" | string

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface AuthClaims {
  userId: string | null
  username: string | null
  role: AuthRole | null
  permissions: string[]
}

export interface AuthUser {
  id: string
  username: string
  email: string
  status: string
  role: AuthRole
  permissions: string[]
}

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string | null
  user: AuthUser | null
  claims: AuthClaims | null
  isAuthenticated: boolean
  isInitializing: boolean
}

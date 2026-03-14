import { requestJson } from "@/api/httpClient"
import type { AuthUser, LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse } from "@/types/auth"

export function login(request: LoginRequest) {
  return requestJson<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  }, {
    auth: false,
    retryOnUnauthorized: false,
  })
}

export function register(request: RegisterRequest) {
  return requestJson<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  }, {
    auth: false,
    retryOnUnauthorized: false,
  })
}

export function logout(request: RefreshTokenRequest) {
  return requestJson<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify(request),
  }, {
    auth: true,
    retryOnUnauthorized: false,
  })
}

export function refreshToken(request: RefreshTokenRequest) {
  return requestJson<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(request),
  }, {
    auth: false,
    retryOnUnauthorized: false,
  })
}

export function getCurrentUser() {
  return requestJson<AuthUser>("/auth/me", {
    method: "GET",
  })
}

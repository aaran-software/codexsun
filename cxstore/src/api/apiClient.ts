import axios from "axios"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

import { clearAuthState, getAccessToken, getRefreshToken, refreshSession } from "@/state/authStore"

type RequestConfig = {
  skipAuth?: boolean
  skipRetry?: boolean
}

type StorefrontRequestConfig = InternalAxiosRequestConfig & {
  _cx?: RequestConfig
}

function withStorefrontConfig(config: AxiosRequestConfig, storefrontConfig?: RequestConfig): AxiosRequestConfig {
  return { ...config, _cx: storefrontConfig } as AxiosRequestConfig
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: {
    Accept: "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const nextConfig = config as StorefrontRequestConfig

  if (!nextConfig._cx?.skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      nextConfig.headers.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  return nextConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error.response
    const config = error.config as StorefrontRequestConfig | undefined

    if (!response || !config || config._cx?.skipRetry || response.status !== 401 || !getRefreshToken()) {
      if (response?.status === 401) {
        clearAuthState()
      }

      return Promise.reject(error)
    }

    const refreshed = await refreshSession()
    if (!refreshed) {
      clearAuthState()
      return Promise.reject(error)
    }

    config._cx = { ...(config._cx ?? {}), skipRetry: true }
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return apiClient(config)
  },
)

export async function getJson<T>(url: string, config?: RequestConfig) {
  const response = await apiClient.get<T>(url, withStorefrontConfig({}, config))
  return response.data
}

export async function postJson<TResponse, TRequest>(url: string, data: TRequest, config?: RequestConfig) {
  const response = await apiClient.post<TResponse>(url, data, withStorefrontConfig({}, config))
  return response.data
}

export async function putJson<TResponse, TRequest>(url: string, data: TRequest, config?: RequestConfig) {
  const response = await apiClient.put<TResponse>(url, data, withStorefrontConfig({}, config))
  return response.data
}

export async function deleteJson<TResponse>(url: string, config?: RequestConfig) {
  const response = await apiClient.delete<TResponse>(url, withStorefrontConfig({}, config))
  return response.data
}

import axios from "axios"

import { clearAuthState, getAccessToken, getRefreshToken, refreshSession } from "@/state/authStore"

type RequestConfig = {
  skipAuth?: boolean
  skipRetry?: boolean
}

declare module "axios" {
  export interface InternalAxiosRequestConfig<D = unknown> {
    metadata?: RequestConfig
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  headers: {
    Accept: "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  if (!config.metadata?.skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (!response || !config || config.metadata?.skipRetry || response.status !== 401 || !getRefreshToken()) {
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

    config.metadata = { ...(config.metadata ?? {}), skipRetry: true }
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return apiClient(config)
  },
)

export async function getJson<T>(url: string, config?: RequestConfig) {
  const response = await apiClient.get<T>(url, { metadata: config })
  return response.data
}

export async function postJson<TResponse, TRequest>(url: string, data: TRequest, config?: RequestConfig) {
  const response = await apiClient.post<TResponse>(url, data, { metadata: config })
  return response.data
}

export async function putJson<TResponse, TRequest>(url: string, data: TRequest, config?: RequestConfig) {
  const response = await apiClient.put<TResponse>(url, data, { metadata: config })
  return response.data
}

export async function deleteJson<TResponse>(url: string, config?: RequestConfig) {
  const response = await apiClient.delete<TResponse>(url, { metadata: config })
  return response.data
}

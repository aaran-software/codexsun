import { clearAuthState, getAccessToken, getRefreshToken, refreshSession } from "@/state/authStore"

interface RequestOptions {
  auth?: boolean
  retryOnUnauthorized?: boolean
}

export class HttpError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.payload = payload
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return await response.json() as T
  }

  return await response.text() as T
}

async function toHttpError(response: Response) {
  let payload: unknown = null

  try {
    payload = await parseResponse<unknown>(response)
  } catch {
    payload = null
  }

  const message =
    typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : `Request failed with status ${response.status}`

  return new HttpError(message, response.status, payload)
}

export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, retryOnUnauthorized = true } = options
  const headers = new Headers(init.headers)

  if (!headers.has("Content-Type") && init.body && !(typeof FormData !== "undefined" && init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  headers.set("Accept", "application/json")

  if (auth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (response.status === 401 && retryOnUnauthorized && auth && getRefreshToken()) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return await requestJson<T>(url, init, { ...options, retryOnUnauthorized: false })
    }

    clearAuthState()
  }

  if (!response.ok) {
    throw await toHttpError(response)
  }

  return await parseResponse<T>(response)
}

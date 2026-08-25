export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const DEFAULT_TIMEOUT_MS = 15_000

const defaultHeaders = {
  "Content-Type": "application/json",
}

// Las rutas de /auth manejan el 401 por su cuenta (login con credenciales
// inválidas, o el /auth/me inicial cuando todavía no hay sesión).
function redirectToLogin(endpoint: string) {
  if (typeof window === "undefined") return
  if (endpoint.startsWith("/auth/")) return
  if (window.location.pathname === "/") return
  window.location.href = "/"
}

export class ApiError extends Error {
  readonly status: number
  readonly endpoint: string
  readonly details?: unknown

  constructor(message: string, status: number, endpoint: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.endpoint = endpoint
    this.details = details
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500
  }

  get isServerError() {
    return this.status >= 500
  }

  get isNetworkError() {
    return this.status === 0
  }
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

async function parseErrorBody(response: Response): Promise<{ message: string; details?: unknown }> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as {
        message?: string
        error?: unknown
        data?: unknown
      }
      return {
        message: body.message ?? `HTTP ${response.status}`,
        // `error` en los errores de validación, `data` en los de negocio.
        details: body.error ?? body.data,
      }
    } catch {
      return { message: `HTTP ${response.status}` }
    }
  }
  try {
    const text = await response.text()
    return { message: text || `HTTP ${response.status}` }
  } catch {
    return { message: `HTTP ${response.status}` }
  }
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options

  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

  // Combinar abort externo con el del timeout.
  const onExternalAbort = () => controller.abort()
  signal?.addEventListener("abort", onExternalAbort)

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: { ...defaultHeaders, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      const { message, details } = await parseErrorBody(response)
      if (response.status === 401) {
        redirectToLogin(endpoint)
      }
      throw new ApiError(message, response.status, endpoint, details)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) {
        throw new ApiError("Request cancelled", 0, endpoint, error)
      }
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 0, endpoint, error)
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Unknown network error",
      0,
      endpoint,
      error,
    )
  } finally {
    clearTimeout(timeoutHandle)
    signal?.removeEventListener("abort", onExternalAbort)
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body: data }),

  put: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body: data }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
}

export default api

/**
 * Cliente HTTP centralizado.
 *
 * Responsabilidades:
 * - Añade el header Authorization en cada petición autenticada.
 * - Si recibe 401 y hay refresh_token, intenta renovar el access_token
 *   automáticamente (una sola vez) y reintenta la petición original.
 * - Si el refresh también falla, limpia el almacenamiento y redirige al login.
 *
 * NOTA: la URL base apunta al proxy de Vite (/api → http://localhost:8000).
 * En producción se cambiaría por la variable de entorno VITE_API_BASE.
 */

const BASE = 'http://localhost:8000'

// --- Gestión de tokens en localStorage -----------------------------------

export const tokenStorage = {
  getAccess:   () => localStorage.getItem('access_token'),
  getRefresh:  () => localStorage.getItem('refresh_token'),
  set(access: string, refresh: string) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  },
  clear() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

// --- Refresh token --------------------------------------------------------

let isRefreshing = false
// Promesa compartida para que múltiples peticiones simultáneas esperen el
// mismo refresh en lugar de lanzarlo varias veces.
let refreshPromise: Promise<string> | null = null

async function attemptRefresh(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    const refresh = tokenStorage.getRefresh()
    if (!refresh) throw new Error('No hay refresh token')

    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })

    if (!res.ok) {
      tokenStorage.clear()
      window.location.href = '/login'
      throw new Error('Refresh fallido')
    }

    const data = await res.json()
    tokenStorage.set(data.access_token, data.refresh_token)
    return data.access_token as string
  })().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}

// --- Fetch con reintentos -------------------------------------------------

type RequestOptions = RequestInit & { skipAuth?: boolean }

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, ...init } = options

  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const token = tokenStorage.getAccess()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(`${BASE}${path}`, { ...init, headers })

  // Reintento automático tras refresh
  if (res.status === 401 && !skipAuth) {
    try {
      const newToken = await attemptRefresh()
      headers.set('Authorization', `Bearer ${newToken}`)
      res = await fetch(`${BASE}${path}`, { ...init, headers })
    } catch {
      // attemptRefresh ya redirigió al login
      throw new Error('No autorizado')
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    const message =
      typeof body.detail === 'string'
        ? body.detail
        : JSON.stringify(body.detail)
    throw new ApiError(res.status, message)
  }

  // Respuesta vacía (204 No Content, etc.)
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// Error tipado para que los componentes puedan distinguir errores de API
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
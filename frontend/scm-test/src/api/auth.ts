import { apiFetch, tokenStorage } from './client.ts'

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export async function login(username: string, password: string): Promise<void> {
  const data = await apiFetch<TokenPair>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  })
  tokenStorage.set(data.access_token, data.refresh_token)
}

export function logout(): void {
  // La API no tiene endpoint de logout (los tokens JWT son stateless).
  // Simplemente borramos los tokens del cliente.
  tokenStorage.clear()
}

export function getCurrentUser(): string | null {
  const token = tokenStorage.getAccess()
  if (!token) return null
  try {
    // Decodifica el payload del JWT sin verificar la firma (solo para UI)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? null
  } catch {
    return null
  }
}
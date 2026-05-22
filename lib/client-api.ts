/**
 * Browser-safe API fetch helpers (respects NEXT_PUBLIC_API_BASE_URL).
 */
import { apiPath, publicApiPath, resolveFetchUrl } from '@/lib/config/urls'

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith('/api') ? resolveFetchUrl(path) : resolveFetchUrl(apiPath(path))
  return fetch(url, { credentials: 'same-origin', ...init })
}

export function publicApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const seg = path.startsWith('/store') ? path : path.startsWith('/') ? path : `/${path}`
  return fetch(resolveFetchUrl(publicApiPath(seg)), { credentials: 'same-origin', ...init })
}

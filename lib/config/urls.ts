/**
 * Central URL resolution — no hardcoded hosts in business logic.
 * Override via environment variables (see .env.example).
 */

export type AppUrlSource = {
  requestOrigin?: string | null
  headers?: { get(name: string): string | null }
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = process.env[key]?.trim()
    if (v) return v
  }
  return undefined
}

/** Public app origin (storefront links, OAuth redirects, sitemap, emails). */
export function getAppBaseUrl(source?: AppUrlSource): string {
  const explicit = readEnv('NEXT_PUBLIC_APP_URL', 'APP_URL', 'PUBLIC_APP_URL')
  if (explicit) return trimSlash(explicit)

  if (source?.headers) {
    const host = source.headers.get('x-forwarded-host') || source.headers.get('host')
    if (host) {
      const proto = source.headers.get('x-forwarded-proto') || 'https'
      return trimSlash(`${proto}://${host}`)
    }
  }

  if (source?.requestOrigin) return trimSlash(source.requestOrigin)

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return trimSlash(`https://${vercel}`)

  const host = readEnv('HOST', 'APP_HOST') || 'localhost'
  const port = readEnv('PORT', 'NEXT_PUBLIC_PORT', 'APP_PORT') || '3000'
  const protocol =
    readEnv('APP_PROTOCOL', 'NEXT_PUBLIC_APP_PROTOCOL') ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const needsPort = port !== '80' && port !== '443'
  return trimSlash(`${protocol}://${host}${needsPort ? `:${port}` : ''}`)
}

export function getAppBaseUrlFromRequest(request: {
  nextUrl: { origin: string }
  headers?: { get(name: string): string | null }
}): string {
  return getAppBaseUrl({
    requestOrigin: request.nextUrl.origin,
    headers: request.headers,
  })
}

/** API mount path (default `/api`). */
export function getApiRoot(): string {
  return trimSlash(readEnv('API_ROOT', 'NEXT_PUBLIC_API_ROOT') || '/api')
}

/** Relative API path, e.g. `apiPath('/v2/orders')` → `/api/v2/orders`. */
export function apiPath(subpath: string): string {
  const seg = subpath.startsWith('/') ? subpath : `/${subpath}`
  return `${getApiRoot()}${seg}`
}

/** Relative public API path under `/api/public`. */
export function publicApiPath(subpath: string): string {
  const seg = subpath.startsWith('/') ? subpath : `/${subpath}`
  const cleaned = seg.replace(/^\/public\/?/, '')
  return `${getApiRoot()}/public${cleaned.startsWith('/') ? cleaned : `/${cleaned}`}`
}

/** Absolute app URL for a path. */
export function appUrl(path: string, base?: string): string {
  const root = trimSlash(base || getAppBaseUrl())
  const p = path.startsWith('/') ? path : `/${path}`
  return `${root}${p}`
}

/** Absolute API URL (server-side callbacks, webhooks to self, share links). */
export function absoluteApiUrl(subpath: string, base?: string): string {
  return appUrl(apiPath(subpath), base)
}

/** Absolute public API URL. */
export function absolutePublicApiUrl(subpath: string, base?: string): string {
  return appUrl(publicApiPath(subpath), base)
}

/** Client/server fetch: prefix with NEXT_PUBLIC_API_BASE_URL when API is on another host. */
export function resolveFetchUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  const apiBase = readEnv('NEXT_PUBLIC_API_BASE_URL', 'API_BASE_URL')
  if (apiBase) return `${trimSlash(apiBase)}${normalized}`
  return normalized
}

export function storePath(tenantSlug: string, subpath = ''): string {
  const p = subpath.startsWith('/') ? subpath : subpath ? `/${subpath}` : ''
  return `/store/${tenantSlug}${p}`
}

export function storeUrl(tenantSlug: string, subpath = '', base?: string): string {
  return appUrl(storePath(tenantSlug, subpath), base)
}

export function traceabilityVerifyUrl(params: {
  hash?: string
  lot?: string
  tenant?: string
  base?: string
}): string {
  const q = new URLSearchParams()
  if (params.hash) q.set('hash', params.hash)
  if (params.lot) q.set('lot', params.lot)
  if (params.tenant) q.set('tenant', params.tenant)
  return `${absolutePublicApiUrl('/traceability/verify', params.base)}?${q.toString()}`
}

/** UI placeholder for URL inputs (not a real endpoint). */
export function urlInputPlaceholder(kind: 'https' | 'webhook' = 'https'): string {
  if (kind === 'webhook') {
    const base = readEnv('NEXT_PUBLIC_APP_URL', 'APP_URL')
    return base ? `${trimSlash(base)}/webhooks/your-endpoint` : 'https://your-domain.com/webhooks/your-endpoint'
  }
  return 'https://your-cdn.com/asset.png'
}

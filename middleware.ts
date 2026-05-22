import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/lib/auth'
import {
  canonicalStorePath,
  extractTenantSlugFromHost,
  isSkippablePlatformHost,
} from '@/lib/platform/tenant-host'

function getMiddlewareJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV !== 'production') {
    return secret || 'dev-only-jwt-secret-not-for-production'
  }
  return null
}

function verifyToken(token: string): JWTPayload | null {
  const secret = getMiddlewareJwtSecret()
  if (!secret) return null
  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    return null
  }
}

const PUBLIC_API_ROUTES = new Set([
  '/api/health',
  '/api/auth/login',
  '/api/auth/login/mfa',
  '/api/auth/register',
  '/api/auth/refresh',
])

const CRON_API_ROUTES = new Set([
  '/api/v2/platform/exports/process',
  '/api/v2/platform/payments/reconcile',
])
const INTERNAL_API_PREFIX = '/api/internal/'

function requiresApiAuth(pathname: string): boolean {
  if (PUBLIC_API_ROUTES.has(pathname)) return false
  if (CRON_API_ROUTES.has(pathname)) return false
  if (pathname.startsWith(INTERNAL_API_PREFIX)) return false
  if (pathname.startsWith('/api/public/')) return false
  if (pathname.startsWith('/api/v2/')) return true
  if (pathname === '/api/auth/me' || pathname === '/api/auth/logout') return true
  return false
}

type TenantHeaderResult = {
  response: NextResponse
  tenantId: string | null
  tenantSlug: string | null
}

async function resolveTenantFromHost(
  request: NextRequest,
  host: string | null,
): Promise<{ tenantId: string | null; tenantSlug: string | null }> {
  if (!host) return { tenantId: null, tenantSlug: null }
  const hostname = host.split(':')[0].toLowerCase()
  if (isSkippablePlatformHost(hostname)) return { tenantId: null, tenantSlug: null }

  try {
    const resolveUrl = new URL('/api/internal/resolve-host', request.url)
    resolveUrl.searchParams.set('host', host)
    const res = await fetch(resolveUrl, { headers: { 'x-middleware': '1' } })
    if (res.ok) {
      const data = (await res.json()) as {
        tenantId?: string | null
        tenantSlug?: string | null
      }
      return {
        tenantId: data.tenantId ?? null,
        tenantSlug: data.tenantSlug ?? null,
      }
    }
  } catch {
    /* resolve-host unavailable */
  }

  const slug = extractTenantSlugFromHost(host)
  return { tenantId: null, tenantSlug: slug }
}

async function applyTenantHeaders(request: NextRequest): Promise<TenantHeaderResult> {
  const host = request.headers.get('host')
  const requestHeaders = new Headers(request.headers)
  const { pathname } = request.nextUrl
  requestHeaders.set('x-pathname', pathname)

  const { tenantId, tenantSlug } = await resolveTenantFromHost(request, host)
  if (tenantSlug) requestHeaders.set('x-tenant-slug', tenantSlug)
  if (tenantId) requestHeaders.set('x-tenant-id', tenantId)

  const slug = tenantSlug ?? extractTenantSlugFromHost(host)
  if (!slug) {
    return {
      response: NextResponse.next({ request: { headers: requestHeaders } }),
      tenantId,
      tenantSlug,
    }
  }

  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone()
    url.pathname = `/store/${slug}`
    return { response: NextResponse.redirect(url), tenantId, tenantSlug: slug }
  }

  const fixedStore = canonicalStorePath(pathname, slug)
  if (fixedStore) {
    const url = request.nextUrl.clone()
    url.pathname = fixedStore
    return { response: NextResponse.redirect(url), tenantId, tenantSlug: slug }
  }

  if (pathname.startsWith('/dashboard') && tenantId) {
    requestHeaders.set('x-tenant-context', 'subdomain')
  }

  return {
    response: NextResponse.next({ request: { headers: requestHeaders } }),
    tenantId,
    tenantSlug: slug,
  }
}

export async function middleware(request: NextRequest) {
  const { response: tenantResponse } = await applyTenantHeaders(request)
  if (tenantResponse.status === 307 || tenantResponse.status === 308) {
    return tenantResponse
  }

  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const payload = accessToken ? verifyToken(accessToken) : null
  const hasValidAccess = Boolean(payload)

  if (requiresApiAuth(pathname) && !hasValidAccess) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  if (pathname.startsWith('/dashboard')) {
    if (!hasValidAccess) {
      const login = new URL('/login', request.url)
      login.searchParams.set('from', pathname)
      const response = NextResponse.redirect(login)
      if (accessToken) {
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token')
      }
      return response
    }

    return tenantResponse
  }

  if (pathname === '/login' || pathname === '/register') {
    if (hasValidAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return tenantResponse
  }

  if (pathname.startsWith('/api/')) {
    return tenantResponse
  }

  return tenantResponse
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/store/:path*',
    '/api/v2/:path*',
    '/api/payments/:path*',
    '/',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/internal/:path*',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  canonicalStorePath,
  extractTenantSlugFromHost,
  isSkippablePlatformHost,
} from '@/lib/platform/tenant-host'

/** Edge middleware only checks cookie presence; JWT is verified in Node route handlers. */
function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get('access_token')?.value)
}

const PUBLIC_API_ROUTES = new Set([
  '/api/health',
  '/api/auth/login',
  '/api/auth/login/mfa',
  '/api/auth/register',
  '/api/auth/refresh',
])

const CRON_API_ROUTES = new Set(['/api/v2/platform/exports/process'])
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

async function applyTenantHeaders(request: NextRequest): Promise<TenantHeaderResult> {
  const host = request.headers.get('host')
  const slug = extractTenantSlugFromHost(host)
  const requestHeaders = new Headers(request.headers)
  let tenantId: string | null = null
  let tenantSlug: string | null = slug

  const { pathname } = request.nextUrl
  requestHeaders.set('x-pathname', pathname)

  if (slug) {
    requestHeaders.set('x-tenant-slug', slug)

    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = `/store/${slug}`
      return { response: NextResponse.redirect(url), tenantId: null, tenantSlug: slug }
    }
    const fixedStore = canonicalStorePath(pathname, slug)
    if (fixedStore) {
      const url = request.nextUrl.clone()
      url.pathname = fixedStore
      return { response: NextResponse.redirect(url), tenantId: null, tenantSlug: slug }
    }
  } else if (host) {
    const hostname = host.split(':')[0].toLowerCase()
    if (!isSkippablePlatformHost(hostname)) {
      try {
        const resolveUrl = new URL('/api/internal/resolve-host', request.url)
        resolveUrl.searchParams.set('host', hostname)
        const res = await fetch(resolveUrl, { headers: { 'x-middleware': '1' } })
        if (res.ok) {
          const data = (await res.json()) as { tenantId?: string | null; tenantSlug?: string | null }
          tenantId = data.tenantId ?? null
          tenantSlug = data.tenantSlug ?? null
        }
      } catch {
        /* resolve-host unavailable */
      }
      if (tenantId) {
        requestHeaders.set('x-tenant-id', tenantId)
        if (pathname === '/' || pathname === '') {
          if (tenantSlug) {
            const url = request.nextUrl.clone()
            url.pathname = `/store/${tenantSlug}`
            return { response: NextResponse.redirect(url), tenantId, tenantSlug }
          }
        }
        if (tenantSlug) {
          const fixedStore = canonicalStorePath(pathname, tenantSlug)
          if (fixedStore) {
            const url = request.nextUrl.clone()
            url.pathname = fixedStore
            return { response: NextResponse.redirect(url), tenantId, tenantSlug }
          }
        }
      }
    }
  }

  return {
    response: NextResponse.next({ request: { headers: requestHeaders } }),
    tenantId,
    tenantSlug,
  }
}

export async function middleware(request: NextRequest) {
  const { response: tenantResponse } = await applyTenantHeaders(request)
  if (tenantResponse.status === 307 || tenantResponse.status === 308) {
    return tenantResponse
  }

  const { pathname } = request.nextUrl
  const hasValidAccess = hasSessionCookie(request)

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
      if (hasValidAccess) {
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
    '/api/auth/me',
    '/api/auth/logout',
    '/api/internal/:path*',
  ],
}

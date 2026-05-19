import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/lib/auth'

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
  '/api/auth/register',
  '/api/auth/refresh',
])

function requiresApiAuth(pathname: string): boolean {
  if (PUBLIC_API_ROUTES.has(pathname)) return false
  if (pathname.startsWith('/api/v2/')) return true
  if (pathname === '/api/auth/me' || pathname === '/api/auth/logout') return true
  return false
}

export function middleware(request: NextRequest) {
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
    return NextResponse.next()
  }

  if (pathname === '/login' || pathname === '/register') {
    if (hasValidAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/api/v2/:path*',
    '/api/auth/me',
    '/api/auth/logout',
  ],
}

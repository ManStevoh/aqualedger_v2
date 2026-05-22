import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function unauthorized(message = 'Unauthorized'): ApiError {
  return new ApiError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Forbidden'): ApiError {
  return new ApiError(message, 403, 'FORBIDDEN')
}

export function notFound(message = 'Not found'): never {
  throw new ApiError(message, 404, 'NOT_FOUND')
}

export function conflict(message: string): ApiError {
  return new ApiError(message, 409, 'CONFLICT')
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function jsonMessage(message: string, data?: unknown, status = 200) {
  return NextResponse.json({ success: true, message, ...(data ? { data } : {}) }, { status })
}

export function handleApiError(error: unknown, route?: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status },
    )
  }

  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
    return NextResponse.json(
      { success: false, error: message, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const message = error instanceof Error ? error.message : 'Internal server error'

  if (message === 'Unauthorized') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  if (message === 'Forbidden') {
    return NextResponse.json(
      { success: false, error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  logger.error('API error', { route, error: message })

  const isDbError =
    /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ER_ACCESS_DENIED|ER_BAD_DB_ERROR|connect/i.test(message)
  const clientMessage =
    process.env.NODE_ENV !== 'production' && isDbError
      ? 'Database unavailable. Start MySQL (port 3306) and check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env.'
      : 'Internal server error'

  return NextResponse.json(
    { success: false, error: clientMessage, code: isDbError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_ERROR' },
    { status: 500 },
  )
}

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

const MAINTENANCE_EXEMPT_V2 = new Set([
  '/api/v2/platform/settings',
  '/api/v2/platform/health',
  '/api/v2/platform/impersonate',
  '/api/v2/platform/recaptcha',
  '/api/v2/platform/exports/process',
  '/api/v2/platform/reports/run-scheduled',
])

async function assertV2PlatformGuards(request: NextRequest): Promise<void> {
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/api/v2/')) return

  if (MAINTENANCE_EXEMPT_V2.has(pathname)) return

  const token = request.cookies.get('access_token')?.value
  if (!token) return

  const jwt = await import('jsonwebtoken')
  const secret = process.env.JWT_SECRET
  const devFallback =
    process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-not-for-production' : null
  const resolved =
    secret && secret.length >= 32 ? secret : devFallback
  if (!resolved) return

  try {
    const payload = jwt.verify(token, resolved) as {
      role?: string
      impersonatedBy?: string
    }
    if (payload.role === 'super_admin' || payload.impersonatedBy) return

    const { getMaintenanceStatus } = await import('@/lib/platform/platform-settings')
    const maintenance = await getMaintenanceStatus()
    if (maintenance.enabled) {
      throw new ApiError(
        maintenance.message || 'Platform is under maintenance',
        503,
        'MAINTENANCE',
      )
    }
  } catch (e) {
    if (e instanceof ApiError) throw e
    /* invalid token — route handler will enforce auth */
  }
}

export function apiHandler(handler: RouteHandler, route?: string): RouteHandler {
  return async (request, context) => {
    try {
      const pathname = request.nextUrl.pathname
      if (pathname.startsWith('/api/v2/')) {
        await assertV2PlatformGuards(request)
        const { headers } = await import('next/headers')
        const hdrs = await headers()
        let tenantId = hdrs.get('x-tenant-id')
        if (!tenantId) {
          const token = request.cookies.get('access_token')?.value
          const secret = process.env.JWT_SECRET
          const devFallback =
            process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-not-for-production' : null
          const resolved = secret && secret.length >= 32 ? secret : devFallback
          if (token && resolved) {
            try {
              const jwt = await import('jsonwebtoken')
              const payload = jwt.verify(token, resolved) as {
                userId: string
                role: string
              }
              const { resolveActiveTenantId } = await import('@/lib/platform/tenant-resolve')
              tenantId = await resolveActiveTenantId(payload.userId, payload.role as import('@/lib/auth').UserRole, {
                tenantSlug: hdrs.get('x-tenant-slug'),
                tenantIdHeader: null,
              })
            } catch {
              /* module check falls back to platform-wide flags */
            }
          }
        }
        const { assertApiModuleEnabled } = await import('@/lib/platform/module-enablement')
        await assertApiModuleEnabled(pathname, tenantId)
      }
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, route)
    }
  }
}

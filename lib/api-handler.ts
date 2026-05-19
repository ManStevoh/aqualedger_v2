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

export function notFound(message = 'Not found'): ApiError {
  return new ApiError(message, 404, 'NOT_FOUND')
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
  return NextResponse.json(
    { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 },
  )
}

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>

export function apiHandler(handler: RouteHandler, route?: string): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, route)
    }
  }
}

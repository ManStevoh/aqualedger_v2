import { NextRequest, NextResponse } from 'next/server'
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  setAuthCookies,
} from '@/lib/auth'
import { loginSchema } from '@/lib/validation/schemas'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { handleApiError } from '@/lib/api-handler'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.retryAfterMs || 60000) / 1000)) } },
      )
    }

    const body = loginSchema.parse(await request.json())
    const user = await getUserByEmail(body.email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    }

    const isValidPassword = await verifyPassword(body.password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact support.', code: 'ACCOUNT_SUSPENDED' },
        { status: 403 },
      )
    }

    if (user.status === 'inactive') {
      return NextResponse.json(
        { success: false, error: 'Your account is inactive. Please contact support.', code: 'ACCOUNT_INACTIVE' },
        { status: 403 },
      )
    }

    const userAgent = request.headers.get('user-agent')
    const { accessToken, refreshToken, expiresAt } = await createSession(
      user.id,
      ip !== 'unknown' ? ip : undefined,
      userAgent || undefined,
    )

    await setAuthCookies(accessToken, refreshToken, expiresAt)

    await logAudit({
      userId: user.id,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
    })

    logger.info('User logged in', { userId: user.id, route: 'auth/login' })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatar_url,
          kycVerified: user.kyc_verified,
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'auth/login')
  }
}

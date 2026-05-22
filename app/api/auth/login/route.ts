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
import { recordLoginAlert } from '@/lib/modules/auth/sessions'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import { getMfaStatus } from '@/lib/modules/auth/mfa'
import { signMfaChallengeToken } from '@/lib/modules/auth/mfa-challenge'
import { getMaintenanceStatus } from '@/lib/platform/platform-settings'
import { assertRecaptcha } from '@/lib/modules/security/recaptcha'

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
    await assertRecaptcha('login', body.recaptchaToken, ip)
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

    const maintenance = await getMaintenanceStatus()
    if (maintenance.enabled && user.role !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: maintenance.message || 'The system is under maintenance. Please try again later.',
          code: 'MAINTENANCE',
        },
        { status: 503 },
      )
    }

    const rememberMe = body.rememberMe ?? false
    const mfa = await getMfaStatus(user.id)
    if (mfa.enabled) {
      const mfaChallenge = signMfaChallengeToken(user.id, rememberMe)
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        data: {
          mfaChallenge,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
        },
      })
    }

    const userAgent = request.headers.get('user-agent')
    const { accessToken, refreshToken, expiresAt } = await createSession(
      user.id,
      ip !== 'unknown' ? ip : undefined,
      userAgent || undefined,
      rememberMe,
    )

    await setAuthCookies(accessToken, refreshToken, expiresAt, { rememberMe })

    await logAudit({
      userId: user.id,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
      metadata: { rememberMe },
    })

    try {
      const tenantId = await resolveUserTenantId(user.id)
      await recordLoginAlert({
        userId: user.id,
        tenantId,
        ipAddress: ip !== 'unknown' ? ip : undefined,
        userAgent: userAgent || undefined,
      })
    } catch (alertErr) {
      logger.warn('Login alert not recorded', { userId: user.id, error: alertErr })
    }

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

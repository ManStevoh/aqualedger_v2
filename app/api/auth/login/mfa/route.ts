import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getUserById,
  createSession,
  setAuthCookies,
} from '@/lib/auth'
import { verifyMfaChallengeToken } from '@/lib/modules/auth/mfa-challenge'
import { verifyMfaToken } from '@/lib/modules/auth/mfa'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { handleApiError } from '@/lib/api-handler'
import { logger } from '@/lib/logger'
import { recordLoginAlert } from '@/lib/modules/auth/sessions'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'

const bodySchema = z.object({
  mfaChallenge: z.string().min(10),
  token: z.string().min(4).max(32),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`login-mfa:${ip}`, 15, 15 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' },
        { status: 429 },
      )
    }

    const body = bodySchema.parse(await request.json())
    const challenge = verifyMfaChallengeToken(body.mfaChallenge)
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'MFA session expired. Sign in again.', code: 'MFA_EXPIRED' },
        { status: 401 },
      )
    }

    const user = await getUserById(challenge.userId)
    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account unavailable', code: 'ACCOUNT_UNAVAILABLE' },
        { status: 403 },
      )
    }

    const ok = await verifyMfaToken(user.id, body.token.replace(/\s/g, ''))
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code', code: 'MFA_INVALID' },
        { status: 401 },
      )
    }

    const userAgent = request.headers.get('user-agent')
    const rememberMe = challenge.rememberMe
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
      metadata: { rememberMe, mfaVerified: true },
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
    return handleApiError(error, 'auth/login/mfa')
  }
}

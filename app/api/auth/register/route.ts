import { NextRequest, NextResponse } from 'next/server'
import {
  createUser,
  getUserByEmail,
  createSession,
  setAuthCookies,
  UserRole,
} from '@/lib/auth'
import { registerSchema } from '@/lib/validation/schemas'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { handleApiError } from '@/lib/api-handler'

const SELF_REGISTER_ROLES: UserRole[] = ['investor', 'boat_owner', 'fisherman', 'fish_buyer', 'bmu_official']

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Try again later.', code: 'RATE_LIMITED' },
        { status: 429 },
      )
    }

    const parsed = registerSchema.parse(await request.json())
    const role = (parsed.role || 'fisherman') as UserRole

    if (!SELF_REGISTER_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    const existingUser = await getUserByEmail(parsed.email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 },
      )
    }

    const user = await createUser({
      email: parsed.email,
      password: parsed.password,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone || undefined,
      role,
      initialStatus: 'active',
    })

    const userAgent = request.headers.get('user-agent')
    const { accessToken, refreshToken, expiresAt } = await createSession(
      user.id,
      ip !== 'unknown' ? ip : undefined,
      userAgent || undefined,
    )

    await setAuthCookies(accessToken, refreshToken, expiresAt)

    await logAudit({
      userId: user.id,
      action: 'auth.register',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { role },
      ipAddress: ip,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'auth/register')
  }
}

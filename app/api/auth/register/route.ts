import { NextRequest, NextResponse } from 'next/server'
import {
  createUser,
  getUserByEmail,
  createSession,
  setAuthCookies,
} from '@/lib/auth'
import { registerSchema } from '@/lib/validation/schemas'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { handleApiError } from '@/lib/api-handler'
import {
  businessTypeToUserRole,
  createTenantWithOwner,
  type BusinessType,
} from '@/lib/modules/tenant/onboarding'
import { hostingSummaryForSlug } from '@/lib/modules/tenant/hosting'
import { ApiError } from '@/lib/api-handler'
import { assertRecaptcha } from '@/lib/modules/security/recaptcha'
import { getSignupLocked } from '@/lib/platform/platform-settings'

export async function POST(request: NextRequest) {
  try {
    if (await getSignupLocked()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration is currently disabled',
          code: 'REGISTRATION_LOCKED',
        },
        { status: 403 },
      )
    }

    const ip = getClientIp(request)
    const rate = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Try again later.', code: 'RATE_LIMITED' },
        { status: 429 },
      )
    }

    const parsed = registerSchema.parse(await request.json())
    await assertRecaptcha('register', parsed.recaptchaToken, ip, {
      userAgent: request.headers.get('user-agent') || undefined,
    })

    const businessType = parsed.businessType as BusinessType
    const role = businessTypeToUserRole(businessType)

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

    let tenantId: string
    let slug: string
    try {
      const created = await createTenantWithOwner(
        user.id,
        parsed.organizationName,
        businessType,
        parsed.tenantSlug,
      )
      tenantId = created.tenantId
      slug = created.slug
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create organization'
      if (
        message.includes('subdomain') ||
        message.includes('taken') ||
        message.includes('reserved')
      ) {
        throw new ApiError(message, 400, 'INVALID_TENANT_SLUG')
      }
      throw err
    }

    const hosting = hostingSummaryForSlug(slug, parsed.organizationName)

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
      metadata: { role, businessType, tenantId, organizationName: parsed.organizationName },
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
        tenant: {
          id: tenantId,
          slug,
          name: parsed.organizationName,
        },
        hosting: {
          subdomainHost: hosting.subdomainHost,
          subdomainUrl: hosting.subdomainUrl,
          subdomainStoreUrl: hosting.subdomainStoreUrl,
          platformStoreUrl: hosting.platformStoreUrl,
        },
        onboardingRequired: true,
      },
    })
  } catch (error) {
    return handleApiError(error, 'auth/register')
  }
}

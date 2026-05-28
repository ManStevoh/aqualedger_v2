import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  setAuthCookies,
} from '@/lib/auth'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { queryOne } from '@/lib/db'
import { apiHandler, jsonOk, notFound, unauthorized, forbidden } from '@/lib/api-handler'
import { getClientIp } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const body = loginSchema.parse(await request.json())
  const user = await getUserByEmail(body.email)
  if (!user) {
    throw unauthorized('Invalid email or password')
  }

  const isValidPassword = await verifyPassword(body.password, user.password_hash)
  if (!isValidPassword) {
    throw unauthorized('Invalid email or password')
  }

  if (user.status === 'suspended') {
    throw forbidden('Your account has been suspended. Please contact support.')
  }

  // Check if this user is linked to this specific tenant
  const member = await queryOne<{ role: string; status: string }>(
    `SELECT role, status FROM tenant_members
     WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, user.id],
  )

  if (!member || member.status !== 'active') {
    throw unauthorized('This account is not registered for this storefront. Please sign up first.')
  }

  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent')
  const { accessToken, refreshToken, expiresAt } = await createSession(
    user.id,
    ip !== 'unknown' ? ip : undefined,
    userAgent || undefined,
  )

  await setAuthCookies(accessToken, refreshToken, expiresAt)

  return jsonOk({
    message: 'Logged in successfully',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: member.role,
    },
  })
}, 'public/store/auth/login')

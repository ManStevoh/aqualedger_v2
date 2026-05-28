import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  getUserByEmail,
  verifyPassword,
  createUser,
  createSession,
  setAuthCookies,
} from '@/lib/auth'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { queryOne, execute, generateId } from '@/lib/db'
import { apiHandler, jsonOk, notFound, conflict, unauthorized } from '@/lib/api-handler'
import { getClientIp } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
})

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const body = registerSchema.parse(await request.json())
  const existingUser = await getUserByEmail(body.email)

  let userId: string
  let userEmail: string
  let userFirstName: string
  let userLastName: string
  let userPhone: string | null

  if (existingUser) {
    // User already exists globally. Let's check if they are associated with this storefront's tenant.
    const member = await queryOne<{ role: string; status: string }>(
      `SELECT role, status FROM tenant_members
       WHERE tenant_id = ? AND user_id = ?`,
      [tenantId, existingUser.id],
    )

    if (member) {
      throw conflict('This email is already registered for this store. Please log in.')
    }

    // Verify password first before associating to prevent unauthorized tenant membership additions
    const isValidPassword = await verifyPassword(body.password, existingUser.password_hash)
    if (!isValidPassword) {
      throw conflict('This email is already registered on the platform. Please use the correct password to associate your account with this store.')
    }

    // Link existing global user to the storefront tenant as customer
    const memberId = generateId()
    await execute(
      `INSERT INTO tenant_members (id, tenant_id, user_id, role, status)
       VALUES (?, ?, ?, 'customer', 'active')`,
      [memberId, tenantId, existingUser.id],
    )

    userId = existingUser.id
    userEmail = existingUser.email
    userFirstName = existingUser.first_name
    userLastName = existingUser.last_name
    userPhone = existingUser.phone
  } else {
    // Brand new user, create globally first
    const newUser = await createUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || undefined,
      role: 'user',
      initialStatus: 'active',
    })

    // Link new user to the storefront tenant as customer
    const memberId = generateId()
    await execute(
      `INSERT INTO tenant_members (id, tenant_id, user_id, role, status)
       VALUES (?, ?, ?, 'customer', 'active')`,
      [memberId, tenantId, newUser.id],
    )

    userId = newUser.id
    userEmail = newUser.email
    userFirstName = newUser.first_name
    userLastName = newUser.last_name
    userPhone = newUser.phone
  }

  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent')
  const { accessToken, refreshToken, expiresAt } = await createSession(
    userId,
    ip !== 'unknown' ? ip : undefined,
    userAgent || undefined,
  )

  await setAuthCookies(accessToken, refreshToken, expiresAt)

  return jsonOk({
    message: 'Registered successfully',
    user: {
      id: userId,
      email: userEmail,
      firstName: userFirstName,
      lastName: userLastName,
      phone: userPhone,
      role: 'customer',
    },
  })
}, 'public/store/auth/register')

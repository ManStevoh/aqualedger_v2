import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound, conflict, unauthorized } from '@/lib/api-handler'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { assertRecaptcha } from '@/lib/modules/security/recaptcha'
import { getAuthFromCookies, getUserById } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import {
  resolveTenantIdBySlug,
  getGuestCartView,
} from '@/lib/modules/commerce/guest-cart'
import { checkoutGuestCart } from '@/lib/modules/commerce/guest-checkout'

export const runtime = 'nodejs'

const bodySchema = z.object({
  guestName: z.string().max(200).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().max(20).optional(),
  deliveryAddress: z.string().max(2000).optional(),
  deliverySlotId: z.string().uuid().optional(),
  sessionToken: z.string().optional(),
  paymentMethod: z.enum(['mpesa', 'cod', 'stripe', 'paystack']).default('cod'),
  couponCode: z.string().max(50).optional().nullable(),
  recaptchaToken: z.string().min(1).optional(),
})

function sessionFromRequest(request: NextRequest): string {
  return request.headers.get('x-guest-session') || request.cookies.get('guest_session')?.value || ''
}

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const ip = getClientIp(request)
  const rate = checkRateLimit(`guest-checkout:${ip}`, 15, 15 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many checkout attempts. Try again later.', code: 'RATE_LIMITED' },
      { status: 429 },
    )
  }

  // Enforce Storefront Customer Authentication
  const auth = await getAuthFromCookies()
  if (!auth) {
    throw unauthorized('Customer login required before purchase.')
  }

  const member = await queryOne<{ role: string; status: string }>(
    `SELECT role, status FROM tenant_members
     WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, auth.userId],
  )

  if (!member || member.status !== 'active') {
    throw unauthorized('Account is not registered for this storefront. Please sign up or log in first.')
  }

  const user = await getUserById(auth.userId)
  if (!user || user.status !== 'active') {
    throw unauthorized('Account is inactive or suspended.')
  }

  const body = bodySchema.parse(await request.json())
  await assertRecaptcha('guest_checkout', body.recaptchaToken, ip, {
    tenantId,
    userAgent: request.headers.get('user-agent') || undefined,
  })
  const session = body.sessionToken || sessionFromRequest(request)
  if (!session) throw notFound('Cart session missing')

  const cart = await getGuestCartView(tenantId, session)
  
  const finalPhone = body.guestPhone?.trim() || user.phone?.trim() || ''
  if (body.paymentMethod === 'mpesa' && !finalPhone) {
    throw conflict('Phone number required for M-Pesa payment')
  }

  const result = await checkoutGuestCart(tenantId, cart, {
    buyerId: user.id,
    guestName: body.guestName?.trim() || `${user.first_name} ${user.last_name}`,
    guestEmail: body.guestEmail?.trim() || user.email,
    guestPhone: finalPhone || undefined,
    deliveryAddress: body.deliveryAddress,
    deliverySlotId: body.deliverySlotId,
    couponCode: body.couponCode,
    paymentMethod: body.paymentMethod,
  })

  return jsonOk({ order: result }, 201)
}, 'public/store/checkout')

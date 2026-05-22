import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound, conflict } from '@/lib/api-handler'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { assertRecaptcha } from '@/lib/modules/security/recaptcha'
import {
  resolveTenantIdBySlug,
  getGuestCartView,
} from '@/lib/modules/commerce/guest-cart'
import { checkoutGuestCart } from '@/lib/modules/commerce/guest-checkout'

export const runtime = 'nodejs'

const bodySchema = z.object({
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email(),
  guestPhone: z.string().max(20).optional(),
  deliveryAddress: z.string().max(2000).optional(),
  deliverySlotId: z.string().uuid().optional(),
  sessionToken: z.string().optional(),
  paymentMethod: z.enum(['mpesa', 'cod']).default('cod'),
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

  const body = bodySchema.parse(await request.json())
  await assertRecaptcha('guest_checkout', body.recaptchaToken, ip, {
    tenantId,
    userAgent: request.headers.get('user-agent') || undefined,
  })
  const session = body.sessionToken || sessionFromRequest(request)
  if (!session) throw notFound('Cart session missing')

  const cart = await getGuestCartView(tenantId, session)
  if (body.paymentMethod === 'mpesa' && !body.guestPhone?.trim()) {
    throw conflict('Phone number required for M-Pesa payment')
  }

  const result = await checkoutGuestCart(tenantId, cart, {
    guestName: body.guestName,
    guestEmail: body.guestEmail,
    guestPhone: body.guestPhone,
    deliveryAddress: body.deliveryAddress,
    deliverySlotId: body.deliverySlotId,
    paymentMethod: body.paymentMethod,
  })

  return jsonOk({ order: result }, 201)
}, 'public/store/checkout')

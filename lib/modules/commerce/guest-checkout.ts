import { execute, generateId, transaction } from '@/lib/db'
import { conflict } from '@/lib/api-handler'
import { publishDomainEvent } from '@/lib/events/workflow'
import { enqueueNotification } from '@/lib/notifications/enqueue'
import { tenantWhere } from '@/lib/tenant'
import { validateCoupon } from './coupon-validate'
import type { GuestCartView } from './guest-cart'
import {
  resolveProductVendor,
  groupCartLinesByVendor,
  pickPrimarySeller,
  allocateVendorCommissions,
  type ResolvedVendor,
} from './vendor-resolve'

export interface GuestCheckoutInput {
  buyerId?: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  deliveryAddress?: string
  deliverySlotId?: string | null
  couponCode?: string | null
  paymentMethod?: 'mpesa' | 'cod' | 'stripe' | 'paystack'
}

export interface GuestCheckoutResult {
  orderId: string
  orderNumber: string
  subtotal: number
  discount: number
  tax: number
  total: number
  couponCode: string | null
  paymentIntentId?: string
  paymentPending?: boolean
  paymentSimulated?: boolean
  clientSecret?: string
  checkoutUrl?: string
}

async function resolveGuestBuyerId(tenantId: string): Promise<string> {
  const { queryOne } = await import('@/lib/db')
  const owner = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM tenant_members
     WHERE tenant_id = ? AND role IN ('tenant_owner', 'super_admin', 'admin') AND status = 'active'
     ORDER BY created_at ASC LIMIT 1`,
    [tenantId],
  )
  if (owner) return owner.user_id

  const vendor = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM marketplace_vendors
     WHERE tenant_id = ? AND status = 'active' LIMIT 1`,
    [tenantId],
  )
  if (vendor) return vendor.user_id

  throw conflict('Store is not configured for checkout')
}

function orderNumber(): string {
  return `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function checkoutGuestCart(
  tenantId: string,
  cart: GuestCartView,
  input: GuestCheckoutInput,
 ): Promise<GuestCheckoutResult> {
  if (cart.items.length === 0) throw conflict('Cart is empty')

  if (input.deliverySlotId) {
    const { bookDeliverySlot } = await import('./delivery-slots')
    await bookDeliverySlot(tenantId, input.deliverySlotId)
  }

  const buyerId = input.buyerId || await resolveGuestBuyerId(tenantId)
  const subtotal = cart.subtotal
  const { coupon, discount } = await validateCoupon(tenantId, input.couponCode, subtotal)
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const tax = Math.round(discountedSubtotal * 0.16 * 100) / 100
  const total = Math.round((discountedSubtotal + tax) * 100) / 100

  const result = await transaction(async (conn) => {
    const vendorLines: { productId: string; lineTotal: number; vendor: ResolvedVendor }[] = []
    for (const item of cart.items) {
      const vendor = await resolveProductVendor(conn, tenantId, item.product_id)
      if (!vendor) throw conflict('No active vendor for checkout')
      vendorLines.push({
        productId: item.product_id,
        lineTotal: Number(item.line_total),
        vendor,
      })
    }
    const shares = groupCartLinesByVendor(vendorLines)
    const primary = pickPrimarySeller(shares)
    const sellerId = primary.userId
    const orderId = generateId()
    const number = orderNumber()

    await conn.execute(
      `INSERT INTO orders (
        id, tenant_id, order_number, buyer_id, seller_id, status,
        subtotal, delivery_fee, tax, total, payment_status,
        delivery_address, guest_email, guest_phone, guest_name, delivery_slot_id
      ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, 0, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        orderId,
        tenantId,
        number,
        buyerId,
        sellerId,
        discountedSubtotal,
        tax,
        total,
        input.deliveryAddress ?? null,
        input.guestEmail,
        input.guestPhone ?? null,
        input.guestName,
        input.deliverySlotId ?? null,
      ],
    )

    for (const item of cart.items) {
      const [prodRows] = await conn.execute(
        `SELECT species_id, base_price FROM product_catalog WHERE id = ? AND tenant_id = ?`,
        [item.product_id, tenantId],
      )
      const product = (prodRows as { species_id: string | null; base_price: number }[])[0]
      if (!product?.species_id) throw conflict('Product missing species')

      await conn.execute(
        `INSERT INTO order_items (id, order_id, listing_id, species_id, quantity_kg, unit_price)
         VALUES (?, ?, NULL, ?, ?, ?)`,
        [generateId(), orderId, product.species_id, item.quantity_kg, item.unit_price],
      )
    }

    const commissionRows = allocateVendorCommissions(shares, subtotal, total)
    for (const row of commissionRows) {
      await conn.execute(
        `INSERT INTO vendor_commissions (
          id, tenant_id, vendor_id, order_id, order_amount,
          commission_rate, commission_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'payable')`,
        [
          generateId(),
          tenantId,
          row.vendor.vendorId,
          orderId,
          row.orderAmount,
          row.vendor.commissionRate,
          row.commissionAmount,
        ],
      )
    }

    if (coupon) {
      await conn.execute(
        `UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ? AND ${tenantWhere()}`,
        [coupon.id, tenantId],
      )
    }

    await conn.execute(
      `UPDATE commerce_guest_carts SET status = 'converted' WHERE id = ?`,
      [cart.cartId],
    )

    return {
      orderId,
      orderNumber: number,
      subtotal: discountedSubtotal,
      discount,
      tax,
      total,
      couponCode: coupon?.code ?? null,
    }
  })

  await publishDomainEvent({
    tenantId,
    eventType: 'commerce.order.created',
    aggregateType: 'order',
    aggregateId: result.orderId,
    payload: {
      orderNumber: result.orderNumber,
      guest: true,
      total: result.total,
      discount: result.discount,
    },
  })

  try {
    await enqueueNotification({
      tenantId,
      channel: 'email',
      recipient: input.guestEmail,
      subject: `Order confirmed — ${result.orderNumber}`,
      body: `Thank you ${input.guestName}. Your order ${result.orderNumber} total KES ${result.total}${
        result.discount > 0 ? ` (saved KES ${result.discount})` : ''
      } is confirmed.`,
    })
  } catch {
    /* non-blocking */
  }

  try {
    const { registerGuestOrderLookup } = await import('./customer-portal')
    await registerGuestOrderLookup(tenantId, result.orderId, input.guestEmail)
  } catch {
    /* non-blocking */
  }

  const payWithMpesa = input.paymentMethod === 'mpesa' && input.guestPhone?.trim()
  if (payWithMpesa) {
    const { initiateStkPush } = await import('@/lib/modules/integrations/mpesa')
    const stk = await initiateStkPush({
      tenantId,
      amount: result.total,
      phoneNumber: input.guestPhone!.trim(),
      orderId: result.orderId,
      description: `Order ${result.orderNumber}`,
      metadata: {
        purpose: 'order_checkout',
        order_number: result.orderNumber,
        guest_email: input.guestEmail,
      },
    })
    return {
      ...result,
      paymentIntentId: stk.paymentIntentId,
      paymentPending: !stk.simulated,
      paymentSimulated: stk.simulated,
    }
  }

  if (input.paymentMethod === 'paystack' && input.guestEmail?.trim()) {
    const { initializePaystackTransaction } = await import('@/lib/modules/integrations/paystack')
    const ps = await initializePaystackTransaction({
      tenantId,
      amount: result.total,
      email: input.guestEmail.trim(),
      orderId: result.orderId,
      metadata: {
        purpose: 'order_checkout',
        order_number: result.orderNumber,
        guest_email: input.guestEmail,
      },
    })
    return {
      ...result,
      paymentIntentId: ps.paymentIntentId,
      paymentPending: !ps.stub,
      paymentSimulated: ps.stub,
      checkoutUrl: ps.authorizationUrl,
    }
  }

  if (input.paymentMethod === 'stripe') {
    const { createStripePaymentIntent } = await import('@/lib/modules/integrations/stripe')
    const stripe = await createStripePaymentIntent({
      tenantId,
      amount: result.total,
      orderId: result.orderId,
      customerEmail: input.guestEmail,
    })
    return {
      ...result,
      paymentIntentId: stripe.paymentIntentId,
      paymentPending: stripe.status !== 'succeeded',
      paymentSimulated: stripe.externalRef.startsWith('pi_stub_'),
      clientSecret: stripe.clientSecret ?? undefined,
      checkoutUrl: stripe.checkoutUrl ?? undefined,
    }
  }

  return result
}

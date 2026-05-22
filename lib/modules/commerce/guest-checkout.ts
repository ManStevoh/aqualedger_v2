import { queryOne, execute, generateId, transaction } from '@/lib/db'
import { notFound, conflict } from '@/lib/api-handler'
import { publishDomainEvent } from '@/lib/events/workflow'
import { enqueueNotification } from '@/lib/notifications/enqueue'
import type { GuestCartView } from './guest-cart'

export interface GuestCheckoutInput {
  guestName: string
  guestEmail: string
  guestPhone?: string
  deliveryAddress?: string
  deliverySlotId?: string | null
  couponCode?: string | null
  paymentMethod?: 'mpesa' | 'cod'
}

export interface GuestCheckoutResult {
  orderId: string
  orderNumber: string
  total: number
  paymentIntentId?: string
  paymentPending?: boolean
  paymentSimulated?: boolean
}

async function resolveGuestBuyerId(tenantId: string): Promise<string> {
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

  const buyerId = await resolveGuestBuyerId(tenantId)
  const subtotal = cart.subtotal
  const tax = Math.round(subtotal * 0.16 * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  const result = await transaction(async (conn) => {
    const [vendorRows] = await conn.execute(
      `SELECT user_id FROM marketplace_vendors
       WHERE tenant_id = ? AND status = 'active' ORDER BY created_at ASC LIMIT 1`,
      [tenantId],
    )
    const vendor = (vendorRows as { user_id: string }[])[0]
    if (!vendor) throw conflict('No active vendor for checkout')

    const sellerId = vendor.user_id
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
        subtotal,
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

    await conn.execute(
      `UPDATE commerce_guest_carts SET status = 'converted' WHERE id = ?`,
      [cart.cartId],
    )

    return { orderId, orderNumber: number, total }
  })

  await publishDomainEvent({
    tenantId,
    eventType: 'commerce.order.created',
    aggregateType: 'order',
    aggregateId: result.orderId,
    payload: { orderNumber: result.orderNumber, guest: true, total: result.total },
  })

  try {
    await enqueueNotification({
      tenantId,
      channel: 'email',
      recipient: input.guestEmail,
      subject: `Order confirmed — ${result.orderNumber}`,
      body: `Thank you ${input.guestName}. Your order ${result.orderNumber} total KES ${result.total} is confirmed.`,
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

  return result
}

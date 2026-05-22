import type { Connection } from 'mysql2/promise'
import { query, queryOne, execute, generateId, transaction } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import { publishDomainEvent } from '@/lib/events/workflow'
import type { CheckoutInput } from './schemas'
import type { CouponRow } from './service'

interface CartItemForCheckout {
  id: string
  listing_id: string | null
  product_id: string | null
  quantity_kg: number
  unit_price: number
  line_total: number
}

interface ResolvedLine {
  listingId: string | null
  productId: string | null
  speciesId: string
  sellerId: string
  quantityKg: number
  unitPrice: number
  lineTotal: number
}

export interface CheckoutResult {
  orderId: string
  orderNumber: string
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  couponCode: string | null
  itemCount: number
}

function orderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

async function validateCoupon(
  tenantId: string,
  code: string | null | undefined,
  subtotal: number,
): Promise<{ coupon: CouponRow | null; discount: number }> {
  if (!code?.trim()) return { coupon: null, discount: 0 }

  const coupon = await queryOne<CouponRow>(
    `SELECT * FROM coupons
     WHERE ${tenantWhere()} AND code = ? AND status = 'active'`,
    [tenantId, code.trim().toUpperCase()],
  )
  if (!coupon) throw notFound('Coupon not found or inactive')

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    throw conflict('Coupon is not yet valid')
  }
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    throw conflict('Coupon has expired')
  }
  if (Number(coupon.min_order_amount) > subtotal) {
    throw conflict(`Minimum order amount is KES ${coupon.min_order_amount}`)
  }
  if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) {
    throw conflict('Coupon usage limit reached')
  }

  let discount = 0
  if (coupon.discount_type === 'percent') {
    discount = Math.round(subtotal * (Number(coupon.discount_value) / 100) * 100) / 100
  } else {
    discount = Math.min(Number(coupon.discount_value), subtotal)
  }

  return { coupon, discount }
}

async function resolveCheckoutLines(
  conn: Connection,
  tenantId: string,
  items: CartItemForCheckout[],
): Promise<ResolvedLine[]> {
  const lines: ResolvedLine[] = []
  let sellerId: string | null = null

  for (const item of items) {
    if (item.listing_id) {
      const [rows] = await conn.execute(
        `SELECT id, seller_id, species_id, available_quantity_kg, price_per_kg, status
         FROM fish_listings
         WHERE id = ? AND ${tenantWhere()} FOR UPDATE`,
        [item.listing_id, tenantId],
      )
      const listing = (rows as {
        id: string
        seller_id: string
        species_id: string
        available_quantity_kg: number
        price_per_kg: number
        status: string
      }[])[0]

      if (!listing) throw notFound(`Listing ${item.listing_id} not found`)
      if (listing.status !== 'available') throw conflict('A cart item is no longer available')
      if (Number(listing.available_quantity_kg) < Number(item.quantity_kg)) {
        throw conflict('Insufficient quantity for a cart item')
      }

      if (sellerId === null) sellerId = listing.seller_id
      else if (sellerId !== listing.seller_id) {
        throw conflict('All items must be from the same seller')
      }

      lines.push({
        listingId: item.listing_id,
        productId: null,
        speciesId: listing.species_id,
        sellerId: listing.seller_id,
        quantityKg: Number(item.quantity_kg),
        unitPrice: Number(listing.price_per_kg),
        lineTotal: Number(item.line_total),
      })
      continue
    }

    if (item.product_id) {
      const [rows] = await conn.execute(
        `SELECT id, species_id, base_price, status FROM product_catalog
         WHERE id = ? AND ${tenantWhere()} FOR UPDATE`,
        [item.product_id, tenantId],
      )
      const product = (rows as {
        id: string
        species_id: string | null
        base_price: number
        status: string
      }[])[0]

      if (!product) throw notFound(`Product ${item.product_id} not found`)
      if (product.status !== 'active') throw conflict('A cart product is not available')
      if (!product.species_id) throw conflict('Product missing species for order fulfillment')

      const [vendorRows] = await conn.execute(
        `SELECT user_id FROM marketplace_vendors
         WHERE ${tenantWhere()} AND status = 'active'
         ORDER BY created_at ASC LIMIT 1`,
        [tenantId],
      )
      const vendor = (vendorRows as { user_id: string }[])[0]
      if (!vendor) throw conflict('No active vendor configured for catalog checkout')

      if (sellerId === null) sellerId = vendor.user_id
      else if (sellerId !== vendor.user_id) {
        throw conflict('All items must be from the same seller')
      }

      lines.push({
        listingId: null,
        productId: item.product_id,
        speciesId: product.species_id,
        sellerId: vendor.user_id,
        quantityKg: Number(item.quantity_kg),
        unitPrice: Number(product.base_price),
        lineTotal: Number(item.line_total),
      })
    }
  }

  if (lines.length === 0) throw conflict('Cart is empty')
  return lines
}

export async function checkout(
  tenantId: string,
  userId: string,
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const cart = await queryOne<{ id: string; user_id: string; status: string }>(
    `SELECT id, user_id, status FROM commerce_carts
     WHERE id = ? AND ${tenantWhere()} AND user_id = ? AND status = 'active'`,
    [input.cartId, tenantId, userId],
  )
  if (!cart) throw notFound('Active cart not found')

  const cartItems = await query<CartItemForCheckout>(
    `SELECT id, listing_id, product_id, quantity_kg, unit_price, line_total
     FROM commerce_cart_items WHERE cart_id = ?`,
    [cart.id],
  )
  if (cartItems.length === 0) throw conflict('Cart is empty')

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.line_total), 0)
  const { coupon, discount } = await validateCoupon(tenantId, input.couponCode, subtotal)
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const deliveryFee = 0
  const tax = Math.round(discountedSubtotal * 0.16 * 100) / 100
  const total = Math.round((discountedSubtotal + deliveryFee + tax) * 100) / 100

  const result = await transaction(async (conn) => {
    const lines = await resolveCheckoutLines(conn, tenantId, cartItems)
    const sellerId = lines[0].sellerId
    const orderId = generateId()
    const number = orderNumber()

    await conn.execute(
      `INSERT INTO orders (
        id, tenant_id, order_number, buyer_id, seller_id, status,
        subtotal, delivery_fee, tax, total, payment_status, delivery_address
      ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'unpaid', ?)`,
      [
        orderId,
        tenantId,
        number,
        userId,
        sellerId,
        discountedSubtotal,
        deliveryFee,
        tax,
        total,
        input.deliveryAddress ?? null,
      ],
    )

    for (const line of lines) {
      await conn.execute(
        `INSERT INTO order_items (id, order_id, listing_id, species_id, quantity_kg, unit_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          orderId,
          line.listingId,
          line.speciesId,
          line.quantityKg,
          line.unitPrice,
        ],
      )

      if (line.listingId) {
        const [qtyRows] = await conn.execute(
          `SELECT available_quantity_kg FROM fish_listings WHERE id = ?`,
          [line.listingId],
        )
        const listingQty = (qtyRows as { available_quantity_kg: number }[])[0]
        const remaining = Number(listingQty?.available_quantity_kg ?? 0) - line.quantityKg
        await conn.execute(
          `UPDATE fish_listings SET
            available_quantity_kg = ?,
            status = CASE WHEN ? <= 0 THEN 'sold_out' ELSE status END
           WHERE id = ?`,
          [Math.max(0, remaining), remaining, line.listingId],
        )
      }
    }

    const [vendorRows] = await conn.execute(
      `SELECT id, commission_rate FROM marketplace_vendors
       WHERE ${tenantWhere()} AND user_id = ? AND status = 'active'`,
      [tenantId, sellerId],
    )
    const vendor = (vendorRows as { id: string; commission_rate: number }[])[0]

    if (vendor) {
      const commissionRate = Number(vendor.commission_rate)
      const commissionAmount = Math.round(total * (commissionRate / 100) * 100) / 100
      await conn.execute(
        `INSERT INTO vendor_commissions (
          id, tenant_id, vendor_id, order_id, order_amount,
          commission_rate, commission_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'payable')`,
        [
          generateId(),
          tenantId,
          vendor.id,
          orderId,
          total,
          commissionRate,
          commissionAmount,
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
      `UPDATE commerce_carts SET status = 'converted', updated_at = NOW()
       WHERE id = ? AND ${tenantWhere()}`,
      [cart.id, tenantId],
    )

    return {
      orderId,
      orderNumber: number,
      subtotal: discountedSubtotal,
      discount,
      deliveryFee,
      tax,
      total,
      couponCode: coupon?.code ?? null,
      itemCount: lines.length,
      sellerId,
    }
  })

  const buyer = await queryOne<{ email: string | null; first_name: string | null }>(
    `SELECT email, first_name FROM users WHERE id = ?`,
    [userId],
  )

  await publishDomainEvent({
    tenantId,
    eventType: 'commerce.order.confirmed',
    aggregateType: 'order',
    aggregateId: result.orderId,
    payload: {
      userId,
      user_id: userId,
      orderNumber: result.orderNumber,
      total: result.total,
      title: 'Order confirmed',
      message: `Your order ${result.orderNumber} has been confirmed for KES ${result.total.toLocaleString()}`,
      subject: `Order ${result.orderNumber} confirmed`,
      recipient: buyer?.email ?? undefined,
      email: buyer?.email ?? undefined,
    },
  })

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    subtotal: result.subtotal,
    discount: result.discount,
    deliveryFee: result.deliveryFee,
    tax: result.tax,
    total: result.total,
    couponCode: result.couponCode,
    itemCount: result.itemCount,
  }
}

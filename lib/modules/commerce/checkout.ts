import type { Connection } from 'mysql2/promise'
import { query, queryOne, execute, generateId, transaction } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import { publishDomainEvent } from '@/lib/events/workflow'
import type { CheckoutInput } from './schemas'
import { validateCoupon } from './coupon-validate'
import {
  resolveProductVendor,
  groupCartLinesByVendor,
  pickPrimarySeller,
  allocateVendorCommissions,
  type ResolvedVendor,
} from './vendor-resolve'

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
  paymentIntentId?: string
  paymentPending?: boolean
  paymentSimulated?: boolean
  checkoutUrl?: string
}

function orderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

async function buildCatalogVendorShares(
  conn: Connection,
  tenantId: string,
  items: CartItemForCheckout[],
) {
  const vendorLines: { productId: string; lineTotal: number; vendor: ResolvedVendor }[] = []
  for (const item of items) {
    if (!item.product_id) continue
    const vendor = await resolveProductVendor(conn, tenantId, item.product_id)
    if (!vendor) continue
    vendorLines.push({
      productId: item.product_id,
      lineTotal: Number(item.line_total),
      vendor,
    })
  }
  return groupCartLinesByVendor(vendorLines)
}

async function legacySingleVendorCommission(
  conn: Connection,
  tenantId: string,
  sellerId: string,
  total: number,
) {
  const [vendorRows] = await conn.execute(
    `SELECT id, user_id, commission_rate FROM marketplace_vendors
     WHERE ${tenantWhere()} AND user_id = ? AND status = 'active'`,
    [tenantId, sellerId],
  )
  const vendor = (vendorRows as { id: string; user_id: string; commission_rate: number }[])[0]
  if (!vendor) return []
  const resolved: ResolvedVendor = {
    vendorId: vendor.id,
    userId: vendor.user_id,
    commissionRate: Number(vendor.commission_rate),
  }
  return allocateVendorCommissions(
    [{ vendor: resolved, lineTotal: total }],
    total,
    total,
  )
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

      const productVendor = await resolveProductVendor(conn, tenantId, item.product_id)
      if (!productVendor) throw conflict('No active vendor configured for catalog checkout')

      if (sellerId === null) sellerId = productVendor.userId
      else if (sellerId !== productVendor.userId) {
        /* multi-vendor catalog cart: primary seller chosen after all lines resolve */
      }

      lines.push({
        listingId: null,
        productId: item.product_id,
        speciesId: product.species_id,
        sellerId: productVendor.userId,
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
    const catalogShares = await buildCatalogVendorShares(conn, tenantId, cartItems)
    const sellerId =
      catalogShares.length > 0
        ? pickPrimarySeller(catalogShares).userId
        : lines[0].sellerId
    const orderId = generateId()
    const number = orderNumber()

    const paymentStatus =
      input.paymentMethod === 'mpesa' || input.paymentMethod === 'paystack'
        ? 'pending'
        : 'unpaid'

    await conn.execute(
      `INSERT INTO orders (
        id, tenant_id, order_number, buyer_id, seller_id, status,
        subtotal, delivery_fee, tax, total, payment_status, delivery_address
      ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?)`,
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
        paymentStatus,
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

    const preDiscountSubtotal = cartItems.reduce((sum, item) => sum + Number(item.line_total), 0)
    const commissionShares =
      catalogShares.length > 0
        ? allocateVendorCommissions(catalogShares, preDiscountSubtotal, total)
        : await legacySingleVendorCommission(conn, tenantId, sellerId, total)

    for (const row of commissionShares) {
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

  const base = {
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

  if (input.paymentMethod === 'paystack') {
    const buyer = await queryOne<{ email: string | null }>(
      `SELECT email FROM users WHERE id = ?`,
      [userId],
    )
    const email = buyer?.email?.trim()
    if (!email) {
      throw conflict('Paystack checkout requires an email on your user profile')
    }
    const { initializePaystackTransaction } = await import('@/lib/modules/integrations/paystack')
    const ps = await initializePaystackTransaction({
      tenantId,
      amount: result.total,
      email,
      orderId: result.orderId,
      metadata: {
        purpose: 'order_checkout',
        order_number: result.orderNumber,
        buyer_id: userId,
      },
    })
    return {
      ...base,
      paymentIntentId: ps.paymentIntentId,
      paymentPending: !ps.stub,
      paymentSimulated: ps.stub,
      checkoutUrl: ps.authorizationUrl,
    }
  }

  if (input.paymentMethod === 'mpesa') {
    const buyerPhone = await queryOne<{ phone: string | null }>(
      `SELECT phone FROM users WHERE id = ?`,
      [userId],
    )
    const phone = (input.phoneNumber?.trim() || buyerPhone?.phone?.trim() || '').replace(/\s/g, '')
    if (!phone) {
      throw conflict('M-Pesa checkout requires a phone number on your profile or at checkout')
    }
    const { initiateStkPush } = await import('@/lib/modules/integrations/mpesa')
    const stk = await initiateStkPush({
      tenantId,
      amount: result.total,
      phoneNumber: phone,
      orderId: result.orderId,
      description: `Order ${result.orderNumber}`,
      metadata: {
        purpose: 'order_checkout',
        order_number: result.orderNumber,
        buyer_id: userId,
      },
    })
    return {
      ...base,
      paymentIntentId: stk.paymentIntentId,
      paymentPending: !stk.simulated,
      paymentSimulated: stk.simulated,
    }
  }

  return base
}

import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { query, queryOne } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'

type OrderRow = {
  id: string
  tenant_id: string
  order_number: string
  buyer_id: string
  seller_id: string
  status: string
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  payment_status: string
  delivery_address: string | null
  created_at: Date
  buyer_name?: string | null
  buyer_phone?: string | null
  seller_name?: string | null
  seller_phone?: string | null
}

export const GET = apiHandler(async (_request: NextRequest, context) => {
  const auth = await withApiPermission('commerce.orders.read')
  const params = await context?.params
  const id = params?.id
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }

  const conditions: string[] = ['o.id = ?']
  const sqlParams: unknown[] = [id]
  pushTenantCondition(conditions, sqlParams, 'o', auth.tenantId)

  const order = await queryOne<OrderRow>(
    `SELECT o.*,
            o.tenant_id,
            CONCAT(buyer.first_name, ' ', buyer.last_name) as buyer_name,
            buyer.phone as buyer_phone,
            CONCAT(seller.first_name, ' ', seller.last_name) as seller_name,
            seller.phone as seller_phone
     FROM orders o
     LEFT JOIN users buyer ON o.buyer_id = buyer.id
     LEFT JOIN users seller ON o.seller_id = seller.id
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    sqlParams,
  )

  if (!order) {
    throw notFound('Order not found')
  }

  assertTenantMatch(order, auth.tenantId)

  if (!hasFullSystemAccess(auth.role) && auth.userId !== order.buyer_id && auth.userId !== order.seller_id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const items = await query(
    `SELECT oi.*, fl.fish_type, fs.name as species_name
     FROM order_items oi
     LEFT JOIN fish_listings fl ON oi.listing_id = fl.id
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     WHERE oi.order_id = ?`,
    [id],
  )

  return jsonOk({ order: { ...order, items } })
}, 'v2/orders/[id]')

/** Update order status (same rules as PUT /api/v2/orders). */
export const PATCH = apiHandler(async (request: NextRequest, context) => {
  const auth = await withApiPermission('commerce.orders.write')
  const params = await context?.params
  const id = params?.id
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid order id' }, { status: 400 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: string
    paymentStatus?: string
  }

  const order = await queryOne<OrderRow & { tenant_id: string }>(
    'SELECT * FROM orders WHERE id = ?',
    [id],
  )
  if (!order) throw notFound('Order not found')
  assertTenantMatch(order, auth.tenantId)

  const { hasFullSystemAccess } = await import('@/lib/platform-access')
  if (
    !hasFullSystemAccess(auth.role) &&
    auth.userId !== order.buyer_id &&
    auth.userId !== order.seller_id
  ) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { execute } = await import('@/lib/db')

  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'shipped', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  }

  if (body.action && body.action !== order.status) {
    if (!validTransitions[order.status]?.includes(body.action)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from ${order.status} to ${body.action}` },
        { status: 400 },
      )
    }
    await execute(`UPDATE orders SET status = ? WHERE id = ?`, [body.action, id])
  }

  if (body.paymentStatus) {
    await execute('UPDATE orders SET payment_status = ? WHERE id = ?', [body.paymentStatus, id])
  }

  const updated = await queryOne<OrderRow>(
    `SELECT o.*,
            CONCAT(buyer.first_name, ' ', buyer.last_name) as buyer_name,
            CONCAT(seller.first_name, ' ', seller.last_name) as seller_name
     FROM orders o
     LEFT JOIN users buyer ON o.buyer_id = buyer.id
     LEFT JOIN users seller ON o.seller_id = seller.id
     WHERE o.id = ?
     LIMIT 1`,
    [id],
  )

  return jsonOk({ order: updated })
}, 'v2/orders/[id]/patch')

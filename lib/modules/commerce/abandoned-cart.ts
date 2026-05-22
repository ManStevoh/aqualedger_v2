import { storeUrl } from '@/lib/config/urls'
import { query, queryOne, execute } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { enqueueNotification } from '@/lib/notifications/enqueue'

export async function markAbandonedGuestCarts(hoursIdle = 24): Promise<number> {
  const result = await execute(
    `UPDATE commerce_guest_carts
     SET status = 'abandoned'
     WHERE status = 'active'
       AND updated_at < DATE_SUB(NOW(), INTERVAL ? HOUR)
       AND guest_email IS NOT NULL`,
    [hoursIdle],
  )
  return result.affectedRows ?? 0
}

export async function recoverAbandonedCarts(tenantId?: string): Promise<{ emailed: number }> {
  const params: unknown[] = []
  let tenantFilter = ''
  if (tenantId) {
    tenantFilter = 'AND c.tenant_id = ?'
    params.push(tenantId)
  }

  const carts = await query<{
    id: string
    tenant_id: string
    guest_email: string
    session_token: string
  }>(
    `SELECT c.id, c.tenant_id, c.guest_email, c.session_token
     FROM commerce_guest_carts c
     WHERE c.status = 'abandoned' AND c.guest_email IS NOT NULL ${tenantFilter}
     LIMIT 100`,
    params,
  )

  let emailed = 0
  for (const cart of carts) {
    const tenant = await queryOne<{ slug: string; name: string }>(
      `SELECT slug, name FROM tenants WHERE id = ?`,
      [cart.tenant_id],
    )
    const slug = tenant?.slug
    if (!slug) continue

    await enqueueNotification({
      tenantId: cart.tenant_id,
      channel: 'email',
      recipient: cart.guest_email,
      subject: `Complete your order — ${tenant?.name || 'Fresh seafood'}`,
      body: `You left items in your cart. Return to checkout: ${storeUrl(slug, '/cart')}`,
    })

    await execute(
      `UPDATE commerce_guest_carts SET status = 'active' WHERE id = ?`,
      [cart.id],
    )
    emailed++
  }

  return { emailed }
}

export async function listGuestCarts(
  tenantId: string,
  opts: { status?: string; limit?: number } = {},
): Promise<
  Array<{
    id: string
    guest_email: string | null
    status: string
    item_count: number
    subtotal: number
    updated_at: string
  }>
> {
  const limit = Math.min(opts.limit ?? 50, 100)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tenantId]
  if (opts.status) {
    conditions.push('c.status = ?')
    params.push(opts.status)
  }

  const rows = await query<{
    id: string
    guest_email: string | null
    status: string
    updated_at: string
    item_count: number
    subtotal: number
  }>(
    `SELECT c.id, c.guest_email, c.status, c.updated_at,
            COUNT(ci.id) AS item_count,
            COALESCE(SUM(ci.quantity_kg * ci.unit_price), 0) AS subtotal
     FROM commerce_guest_carts c
     LEFT JOIN commerce_guest_cart_items ci ON ci.cart_id = c.id
     WHERE ${conditions.join(' AND ')}
     GROUP BY c.id, c.guest_email, c.status, c.updated_at
     ORDER BY c.updated_at DESC
     LIMIT ?`,
    [...params, limit],
  )

  return rows.map((r) => ({
    id: r.id,
    guest_email: r.guest_email,
    status: r.status,
    item_count: Number(r.item_count),
    subtotal: Number(r.subtotal),
    updated_at: String(r.updated_at),
  }))
}

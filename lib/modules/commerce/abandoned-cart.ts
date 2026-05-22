import { storeUrl } from '@/lib/config/urls'
import { query, queryOne, execute } from '@/lib/db'
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

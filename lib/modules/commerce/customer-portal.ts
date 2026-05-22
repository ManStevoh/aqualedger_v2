import crypto from 'crypto'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { notFound } from '@/lib/api-handler'

export function createLookupToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

export async function registerGuestOrderLookup(
  tenantId: string,
  orderId: string,
  guestEmail: string,
): Promise<string> {
  const token = createLookupToken()
  await execute(
    `INSERT INTO guest_order_lookup (id, tenant_id, guest_email, order_id, lookup_token)
     VALUES (?, ?, ?, ?, ?)`,
    [generateId(), tenantId, guestEmail.toLowerCase(), orderId, token],
  )
  return token
}

export async function listGuestOrders(tenantId: string, email: string, token?: string) {
  if (token) {
    const valid = await queryOne<{ guest_email: string }>(
      `SELECT guest_email FROM guest_order_lookup WHERE tenant_id = ? AND lookup_token = ? LIMIT 1`,
      [tenantId, token],
    )
    if (!valid) throw notFound('Invalid lookup token')
    email = valid.guest_email
  }

  return query(
    `SELECT o.id, o.order_number, o.status, o.total, o.payment_status, o.created_at, o.delivery_address
     FROM orders o
     WHERE o.tenant_id = ? AND o.guest_email = ?
     ORDER BY o.created_at DESC LIMIT 50`,
    [tenantId, email.toLowerCase()],
  )
}

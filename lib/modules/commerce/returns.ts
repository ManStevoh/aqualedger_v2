import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'
import { publishDomainEvent } from '@/lib/events/workflow'

export async function createOrderReturn(
  tenantId: string,
  userId: string,
  input: {
    orderId: string
    reason: string
    reasonDetail?: string | null
    refundAmount?: number
  },
) {
  const order = await queryOne<{ id: string; total: number; buyer_id: string }>(
    `SELECT id, total, buyer_id FROM orders WHERE id = ? AND ${tenantWhere()}`,
    [input.orderId, tenantId],
  )
  if (!order) throw notFound('Order not found')

  const id = generateId()
  const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`
  const refund = input.refundAmount ?? Number(order.total)

  await execute(
    `INSERT INTO order_returns (id, tenant_id, order_id, return_number, reason, reason_detail, refund_amount, requested_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')`,
    [
      id,
      tenantId,
      input.orderId,
      returnNumber,
      input.reason,
      input.reasonDetail ?? null,
      refund,
      userId,
    ],
  )

  await publishDomainEvent({
    tenantId,
    eventType: 'commerce.return.requested',
    aggregateType: 'order_return',
    aggregateId: id,
    payload: { orderId: input.orderId, returnNumber, refund },
  })

  return { id, returnNumber, status: 'requested', refundAmount: refund }
}

export async function updateReturnStatus(
  tenantId: string,
  returnId: string,
  status: 'approved' | 'rejected' | 'refunded' | 'closed',
) {
  const row = await queryOne<{ id: string; order_id: string }>(
    `SELECT id, order_id FROM order_returns WHERE id = ? AND ${tenantWhere()}`,
    [returnId, tenantId],
  )
  if (!row) throw notFound('Return not found')

  await execute(
    `UPDATE order_returns SET status = ?, resolved_at = NOW() WHERE id = ?`,
    [status, returnId],
  )

  if (status === 'refunded') {
    await execute(
      `UPDATE orders SET payment_status = 'refunded', status = 'cancelled' WHERE id = ?`,
      [row.order_id],
    )
  }

  return row
}

export async function listOrderReturns(tenantId: string, limit = 50) {
  return query(
    `SELECT r.*, o.order_number, o.total as order_total,
            CONCAT(u.first_name, ' ', u.last_name) as buyer_name, u.email as buyer_email
     FROM order_returns r
     JOIN orders o ON r.order_id = o.id
     LEFT JOIN users u ON o.buyer_id = u.id
     WHERE r.tenant_id = ?
     ORDER BY r.created_at DESC LIMIT ?`,
    [tenantId, limit],
  )
}

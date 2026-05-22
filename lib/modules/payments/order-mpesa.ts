import { queryOne, execute } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'
import { logger } from '@/lib/logger'
import { tenantWhere } from '@/lib/tenant'
import { initiateStkPush } from '@/lib/modules/integrations/mpesa'

function parseMetadata(raw: string | Record<string, unknown> | null): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export async function completeOrderFromMpesaIntent(
  paymentIntentId: string,
  tenantId: string,
): Promise<void> {
  const intent = await queryOne<{
    id: string
    order_id: string | null
    status: string
    metadata: string | Record<string, unknown> | null
  }>(
    `SELECT id, order_id, status, metadata FROM payment_intents
     WHERE id = ? AND tenant_id = ? AND provider = 'mpesa'`,
    [paymentIntentId, tenantId],
  )
  if (!intent?.order_id || intent.status !== 'completed') return

  const meta = parseMetadata(intent.metadata)
  if (meta.purpose !== 'order_checkout' || meta.order_paid) return

  await execute(
    `UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE id = ? AND tenant_id = ?`,
    [intent.order_id, tenantId],
  )

  await execute(
    `UPDATE payment_intents SET metadata = JSON_MERGE_PATCH(COALESCE(metadata, '{}'), ?), updated_at = NOW()
     WHERE id = ?`,
    [JSON.stringify({ order_paid: true }), paymentIntentId],
  )

  logger.info('Order paid via M-Pesa', { orderId: intent.order_id, paymentIntentId })
}

export async function initiateMpesaPaymentForOrder(
  tenantId: string,
  orderId: string,
  phoneNumber: string,
  userId?: string,
) {
  const order = await queryOne<{
    id: string
    order_number: string
    total: number
    payment_status: string
    buyer_id: string
  }>(
    `SELECT id, order_number, total, payment_status, buyer_id FROM orders
     WHERE id = ? AND ${tenantWhere()}`,
    [orderId, tenantId],
  )
  if (!order) throw notFound('Order not found')
  if (userId && order.buyer_id !== userId) {
    throw conflict('Only the buyer can pay for this order')
  }
  if (order.payment_status === 'paid') {
    throw conflict('Order is already paid')
  }

  const phone = phoneNumber.trim()
  if (!phone) throw conflict('Phone number is required')

  const stk = await initiateStkPush({
    tenantId,
    amount: Number(order.total),
    phoneNumber: phone,
    orderId: order.id,
    description: `Order ${order.order_number}`,
    metadata: {
      purpose: 'order_checkout',
      order_number: order.order_number,
      buyer_id: order.buyer_id,
    },
  })

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    paymentIntentId: stk.paymentIntentId,
    paymentPending: !stk.simulated,
    paymentSimulated: stk.simulated,
  }
}

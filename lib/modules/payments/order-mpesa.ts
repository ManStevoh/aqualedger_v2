import { queryOne, execute } from '@/lib/db'
import { logger } from '@/lib/logger'

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

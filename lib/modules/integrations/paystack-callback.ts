import { queryOne, execute } from '@/lib/db'
import { logger } from '@/lib/logger'
import { verifyPaystackReference } from './paystack'
import { completeOrderFromMpesaIntent } from '@/lib/modules/payments/order-mpesa'
import { logWebhookEvent, markWebhookEvent } from '@/lib/modules/platform/webhook-events'

export async function handlePaystackCallback(reference: string): Promise<{
  ok: boolean
  paymentIntentId?: string
}> {
  const eventId = await logWebhookEvent({
    provider: 'paystack',
    eventType: 'callback',
    externalId: reference,
  })

  const intent = await queryOne<{
    id: string
    tenant_id: string
    order_id: string | null
    status: string
    amount: number
  }>(
    `SELECT id, tenant_id, order_id, status, amount FROM payment_intents
     WHERE provider = 'paystack' AND external_ref = ? LIMIT 1`,
    [reference],
  )

  if (!intent) {
    await markWebhookEvent(eventId, 'failed', 'Payment intent not found')
    return { ok: false }
  }

  if (intent.status === 'completed' || intent.status === 'succeeded') {
    await markWebhookEvent(eventId, 'processed')
    return { ok: true, paymentIntentId: intent.id }
  }

  const verified = await verifyPaystackReference(reference)
  if (!verified.ok) {
    await execute(
      `UPDATE payment_intents SET status = 'failed', updated_at = NOW() WHERE id = ?`,
      [intent.id],
    )
    await markWebhookEvent(eventId, 'failed', `Verify status: ${verified.status}`)
    return { ok: false, paymentIntentId: intent.id }
  }

  await execute(
    `UPDATE payment_intents SET status = 'completed', updated_at = NOW() WHERE id = ?`,
    [intent.id],
  )

  await completeOrderFromPaystack(intent.id, intent.tenant_id)
  const { creditWalletFromMpesaIntent } = await import('@/lib/modules/payments/wallet-mpesa')
  await creditWalletFromMpesaIntent(intent.id, intent.tenant_id)

  await markWebhookEvent(eventId, 'processed')
  logger.info('Paystack payment completed', { reference, intentId: intent.id })
  return { ok: true, paymentIntentId: intent.id }
}

async function completeOrderFromPaystack(paymentIntentId: string, tenantId: string): Promise<void> {
  const intent = await queryOne<{
    order_id: string | null
    metadata: string | Record<string, unknown> | null
  }>(`SELECT order_id, metadata FROM payment_intents WHERE id = ?`, [paymentIntentId])

  if (!intent?.order_id) return

  let meta: Record<string, unknown> = {}
  if (intent.metadata) {
    try {
      meta =
        typeof intent.metadata === 'string'
          ? (JSON.parse(intent.metadata) as Record<string, unknown>)
          : intent.metadata
    } catch {
      meta = {}
    }
  }
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
}

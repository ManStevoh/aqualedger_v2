import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import type { PaymentIntentCreateInput } from './schemas'

export interface PaymentIntentRow {
  id: string
  tenant_id: string
  order_id: string | null
  provider: string
  amount: number
  currency: string
  status: string
  external_ref: string | null
  metadata: string | Record<string, unknown> | null
  created_at: string
  updated_at: string
}

function stubExternalRef(provider: string): string {
  const stamp = Date.now().toString(36).toUpperCase()
  if (provider === 'mpesa') return `MPESA-STUB-${stamp}`
  if (provider === 'stripe') return `pi_stub_${stamp}`
  return `PAY-${stamp}`
}

export async function createPaymentIntent(
  tenantId: string,
  input: PaymentIntentCreateInput,
): Promise<PaymentIntentRow> {
  const id = generateId()
  const externalRef = stubExternalRef(input.provider)
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null

  await execute(
    `INSERT INTO payment_intents
     (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      id,
      tenantId,
      input.orderId ?? null,
      input.provider,
      input.amount,
      input.currency,
      externalRef,
      metadataJson,
    ],
  )

  const row = await queryOne<PaymentIntentRow>(
    `SELECT * FROM payment_intents WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!row) throw new Error('Failed to create payment intent')
  return row
}

export async function getPaymentIntent(
  tenantId: string,
  intentId: string,
): Promise<PaymentIntentRow | null> {
  return queryOne<PaymentIntentRow>(
    `SELECT * FROM payment_intents WHERE id = ? AND ${tenantWhere()}`,
    [intentId, tenantId],
  )
}

export async function listPaymentIntents(
  tenantId: string,
  opts: { status?: string; provider?: string; limit?: number } = {},
): Promise<PaymentIntentRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }
  if (opts.provider) {
    conditions.push('provider = ?')
    params.push(opts.provider)
  }

  return query<PaymentIntentRow>(
    `SELECT * FROM payment_intents WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC LIMIT ?`,
    [...params, limit],
  )
}

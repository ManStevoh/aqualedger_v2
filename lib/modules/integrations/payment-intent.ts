import { execute, generateId } from '@/lib/db'
import { logger } from '@/lib/logger'

export interface PaymentIntentInsertInput {
  tenantId: string
  amount: number
  phoneNumber: string
  orderId?: string
  description?: string
  externalRef: string
  metadata?: Record<string, unknown>
  intentId?: string
}

export interface PaymentIntentInsertResult {
  paymentIntentId: string
  checkoutUrl: string
  externalRef: string
  status: 'pending'
}

export async function insertMpesaPaymentIntent(
  input: PaymentIntentInsertInput,
): Promise<PaymentIntentInsertResult> {
  const id = input.intentId ?? generateId()
  const checkoutUrl = `/dashboard/wallet?payment=${id}`
  const metadata = {
    phone: input.phoneNumber,
    description: input.description ?? 'STK push',
    ...(input.metadata ?? {}),
  }

  await execute(
    `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
     VALUES (?, ?, ?, 'mpesa', ?, 'KES', 'pending', ?, ?)`,
    [
      id,
      input.tenantId,
      input.orderId ?? null,
      input.amount,
      input.externalRef,
      JSON.stringify(metadata),
    ],
  )

  logger.info('payment_intent', {
    paymentIntentId: id,
    provider: 'mpesa',
    amount: input.amount,
    phone: input.phoneNumber,
    externalRef: input.externalRef,
    tenantId: input.tenantId,
  })

  return { paymentIntentId: id, checkoutUrl, externalRef: input.externalRef, status: 'pending' }
}

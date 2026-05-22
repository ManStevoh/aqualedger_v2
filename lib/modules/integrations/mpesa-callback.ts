import { queryOne, execute } from '@/lib/db'
import { logger } from '@/lib/logger'
import { creditWalletFromMpesaIntent } from '@/lib/modules/payments/wallet-mpesa'
import { completeOrderFromMpesaIntent } from '@/lib/modules/payments/order-mpesa'

export interface MpesaStkCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: Array<{ Name?: string; Value?: string | number }>
      }
    }
  }
}

function parseCallbackMetadata(
  items: Array<{ Name?: string; Value?: string | number }> | undefined,
): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  if (!items) return out
  for (const item of items) {
    if (item.Name != null && item.Value != null) out[item.Name] = item.Value
  }
  return out
}

export async function processMpesaStkCallback(body: MpesaStkCallbackBody): Promise<{ ok: boolean }> {
  const cb = body.Body?.stkCallback
  if (!cb?.CheckoutRequestID) {
    logger.warn('M-Pesa callback missing CheckoutRequestID', { body })
    return { ok: false }
  }

  const externalRef = cb.CheckoutRequestID
  const intent = await queryOne<{
    id: string
    tenant_id: string
    status: string
    amount: number
    metadata: string | Record<string, unknown> | null
  }>(
    `SELECT id, tenant_id, status, amount, metadata FROM payment_intents
     WHERE provider = 'mpesa' AND external_ref = ? LIMIT 1`,
    [externalRef],
  )

  if (!intent) {
    logger.warn('M-Pesa callback: payment intent not found', { externalRef })
    return { ok: false }
  }

  if (intent.status === 'completed' || intent.status === 'failed') {
    return { ok: true }
  }

  const resultCode = cb.ResultCode ?? -1
  const metaItems = parseCallbackMetadata(cb.CallbackMetadata?.Item)

  if (resultCode === 0) {
    const receipt = String(metaItems.MpesaReceiptNumber ?? '')
    const paidAmount = Number(metaItems.Amount ?? intent.amount)
    await execute(
      `UPDATE payment_intents SET status = 'completed', metadata = JSON_MERGE_PATCH(COALESCE(metadata, '{}'), ?), updated_at = NOW()
       WHERE id = ?`,
      [
        JSON.stringify({
          mpesa_receipt: receipt,
          paid_amount: paidAmount,
          result_desc: cb.ResultDesc,
          callback_at: new Date().toISOString(),
        }),
        intent.id,
      ],
    )
    await creditWalletFromMpesaIntent(intent.id, intent.tenant_id)
    await completeOrderFromMpesaIntent(intent.id, intent.tenant_id)
    logger.info('M-Pesa payment completed', { paymentIntentId: intent.id, receipt })
  } else {
    await execute(
      `UPDATE payment_intents SET status = 'failed', metadata = JSON_MERGE_PATCH(COALESCE(metadata, '{}'), ?), updated_at = NOW()
       WHERE id = ?`,
      [
        JSON.stringify({
          result_code: resultCode,
          result_desc: cb.ResultDesc,
          callback_at: new Date().toISOString(),
        }),
        intent.id,
      ],
    )
    logger.info('M-Pesa payment failed', { paymentIntentId: intent.id, resultCode, desc: cb.ResultDesc })
  }

  return { ok: true }
}

/** Dev/stub: simulate successful STK callback without Daraja */
export async function simulateMpesaStkSuccess(paymentIntentId: string): Promise<void> {
  const intent = await queryOne<{ external_ref: string | null }>(
    `SELECT external_ref FROM payment_intents WHERE id = ? AND provider = 'mpesa'`,
    [paymentIntentId],
  )
  if (!intent?.external_ref) throw new Error('Payment intent not found')

  await processMpesaStkCallback({
    Body: {
      stkCallback: {
        CheckoutRequestID: intent.external_ref,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: 1 },
            { Name: 'MpesaReceiptNumber', Value: `SIM${Date.now()}` },
          ],
        },
      },
    },
  })
}

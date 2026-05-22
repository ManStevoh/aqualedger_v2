import { insertMpesaPaymentIntent, type PaymentIntentInsertInput } from './payment-intent'
import { simulateMpesaStkSuccess } from './mpesa-callback'

export interface StkPushInput {
  tenantId: string
  amount: number
  phoneNumber: string
  orderId?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface StkPushResult {
  paymentIntentId: string
  checkoutUrl: string
  externalRef: string
  status: 'pending'
  simulated?: boolean
}

export async function initiateStkPushStub(input: StkPushInput): Promise<StkPushResult> {
  const externalRef = `MPESA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const result = await insertMpesaPaymentIntent({
    tenantId: input.tenantId,
    amount: input.amount,
    phoneNumber: input.phoneNumber,
    orderId: input.orderId,
    description: input.description,
    externalRef,
    metadata: { ...input.metadata, stk_stub: true },
  })

  if (process.env.MPESA_STUB_AUTO_COMPLETE !== 'false') {
    try {
      await simulateMpesaStkSuccess(result.paymentIntentId)
      return { ...result, simulated: true }
    } catch {
      /* leave pending for manual simulate */
    }
  }

  return result
}

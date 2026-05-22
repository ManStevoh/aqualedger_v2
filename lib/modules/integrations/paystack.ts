import { generateId, execute } from '@/lib/db'
import { logger } from '@/lib/logger'
import { absolutePublicApiUrl } from '@/lib/config/urls'

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim())
}

function paystackApiBase(): string {
  return (process.env.PAYSTACK_API_BASE_URL || 'https://api.paystack.co').replace(/\/+$/, '')
}

export interface PaystackInitInput {
  tenantId: string
  amount: number
  email: string
  orderId?: string
  metadata?: Record<string, unknown>
}

export interface PaystackInitResult {
  paymentIntentId: string
  authorizationUrl: string
  accessCode: string | null
  reference: string
  stub: boolean
}

export async function initializePaystackTransaction(
  input: PaystackInitInput,
): Promise<PaystackInitResult> {
  const id = generateId()
  const reference = `PS-${id.slice(0, 8)}-${Date.now()}`
  const callbackUrl =
    process.env.PAYSTACK_CALLBACK_URL || absolutePublicApiUrl('/payments/paystack/callback')

  if (!paystackConfigured()) {
    await execute(
      `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
       VALUES (?, ?, ?, 'paystack', ?, 'KES', 'pending', ?, ?)`,
      [
        id,
        input.tenantId,
        input.orderId ?? null,
        input.amount,
        reference,
        JSON.stringify({ stub: true, email: input.email, ...input.metadata }),
      ],
    )
    return {
      paymentIntentId: id,
      authorizationUrl: `/dashboard/wallet?payment=${id}&paystack=stub`,
      accessCode: null,
      reference,
      stub: true,
    }
  }

  const amountMinor = Math.round(input.amount * 100)
  const res = await fetch(`${paystackApiBase()}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: amountMinor,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: {
        tenant_id: input.tenantId,
        order_id: input.orderId,
        payment_intent_id: id,
        ...input.metadata,
      },
    }),
  })

  const data = (await res.json()) as {
    status?: boolean
    data?: { authorization_url: string; access_code: string; reference: string }
    message?: string
  }

  if (!res.ok || !data.status || !data.data?.authorization_url) {
    logger.error('Paystack initialize failed', { data })
    throw new Error(data.message || 'Paystack initialize failed')
  }

  await execute(
    `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
     VALUES (?, ?, ?, 'paystack', ?, 'KES', 'pending', ?, ?)`,
    [
      id,
      input.tenantId,
      input.orderId ?? null,
      input.amount,
      data.data.reference,
      JSON.stringify({
        email: input.email,
        access_code: data.data.access_code,
        ...input.metadata,
      }),
    ],
  )

  return {
    paymentIntentId: id,
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
    stub: false,
  }
}

export async function verifyPaystackReference(reference: string): Promise<{
  ok: boolean
  amount: number
  status: string
}> {
  if (!paystackConfigured()) {
    return { ok: true, amount: 0, status: 'success' }
  }

  const res = await fetch(
    `${paystackApiBase()}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  )
  const data = (await res.json()) as {
    status?: boolean
    data?: { status: string; amount: number }
  }
  const status = data.data?.status ?? 'failed'
  return {
    ok: Boolean(data.status && status === 'success'),
    amount: (data.data?.amount ?? 0) / 100,
    status,
  }
}

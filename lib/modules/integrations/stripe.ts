import { execute, generateId } from '@/lib/db'
import { getStripePaymentIntentsUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'

export interface StripeIntentInput {
  tenantId: string
  amount: number
  currency?: string
  orderId?: string
  customerEmail?: string
}

export interface StripeIntentResult {
  paymentIntentId: string
  clientSecret: string | null
  externalRef: string
  status: string
  checkoutUrl: string | null
}

function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export async function createStripePaymentIntent(
  input: StripeIntentInput,
): Promise<StripeIntentResult> {
  const id = generateId()
  const currency = (input.currency || 'kes').toLowerCase()
  const amountCents = Math.round(input.amount * 100)

  if (!stripeConfigured()) {
    const externalRef = `pi_stub_${Date.now()}`
    await execute(
      `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
       VALUES (?, ?, ?, 'stripe', ?, ?, 'pending', ?, ?)`,
      [
        id,
        input.tenantId,
        input.orderId ?? null,
        input.amount,
        currency.toUpperCase(),
        externalRef,
        JSON.stringify({ stub: true, email: input.customerEmail }),
      ],
    )
    return {
      paymentIntentId: id,
      clientSecret: null,
      externalRef,
      status: 'pending',
      checkoutUrl: `/dashboard/wallet?payment=${id}`,
    }
  }

  try {
    const params = new URLSearchParams()
    params.set('amount', String(amountCents))
    params.set('currency', currency)
    if (input.customerEmail) params.set('receipt_email', input.customerEmail)
    params.set('metadata[tenant_id]', input.tenantId)
    if (input.orderId) params.set('metadata[order_id]', input.orderId)

    const res = await fetch(getStripePaymentIntentsUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = (await res.json()) as {
      id?: string
      client_secret?: string
      status?: string
      error?: { message: string }
    }

    if (!res.ok || !data.id) {
      throw new Error(data.error?.message || `Stripe error ${res.status}`)
    }

    await execute(
      `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
       VALUES (?, ?, ?, 'stripe', ?, ?, ?, ?, ?)`,
      [
        id,
        input.tenantId,
        input.orderId ?? null,
        input.amount,
        currency.toUpperCase(),
        data.status || 'requires_payment_method',
        data.id,
        JSON.stringify({ client_secret: data.client_secret }),
      ],
    )

    return {
      paymentIntentId: id,
      clientSecret: data.client_secret ?? null,
      externalRef: data.id,
      status: data.status || 'pending',
      checkoutUrl: null,
    }
  } catch (err) {
    logger.error('Stripe intent failed, using stub', {
      error: err instanceof Error ? err.message : String(err),
    })
    const externalRef = `pi_stub_${Date.now()}`
    await execute(
      `INSERT INTO payment_intents (id, tenant_id, order_id, provider, amount, currency, status, external_ref, metadata)
       VALUES (?, ?, ?, 'stripe', ?, ?, 'pending', ?, ?)`,
      [
        id,
        input.tenantId,
        input.orderId ?? null,
        input.amount,
        currency.toUpperCase(),
        externalRef,
        JSON.stringify({ stub: true, fallback: true }),
      ],
    )
    return {
      paymentIntentId: id,
      clientSecret: null,
      externalRef,
      status: 'pending',
      checkoutUrl: `/dashboard/wallet?payment=${id}`,
    }
  }
}

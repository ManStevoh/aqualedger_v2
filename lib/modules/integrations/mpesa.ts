import { generateId } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getMpesaOAuthUrl, getMpesaStkPushUrl } from '@/lib/config/external-apis'
import { absolutePublicApiUrl } from '@/lib/config/urls'
import { insertMpesaPaymentIntent } from './payment-intent'
import { initiateStkPushStub, type StkPushInput, type StkPushResult } from './mpesa-stub'

export type { StkPushInput, StkPushResult }

export function mpesaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY,
  )
}

async function getDarajaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!
  const secret = process.env.MPESA_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString('base64')
  const res = await fetch(getMpesaOAuthUrl(), {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) throw new Error(`M-Pesa OAuth failed: ${res.status}`)
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function initiateStkPush(input: StkPushInput): Promise<StkPushResult> {
  if (!mpesaConfigured()) {
    return initiateStkPushStub(input)
  }

  const intentId = generateId()

  try {
    const token = await getDarajaToken()
    const shortcode = process.env.MPESA_SHORTCODE!
    const passkey = process.env.MPESA_PASSKEY!
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
    const phone = input.phoneNumber.replace(/\D/g, '').replace(/^0/, '254')

    const callbackUrl =
      process.env.MPESA_CALLBACK_URL || absolutePublicApiUrl('/payments/mpesa/callback')

    const res = await fetch(getMpesaStkPushUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(input.amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: (input.orderId?.slice(0, 12) || 'AquaERP').slice(0, 12),
        TransactionDesc: (input.description || 'Seafood payment').slice(0, 13),
      }),
    })

    const body = (await res.json()) as {
      CheckoutRequestID?: string
      MerchantRequestID?: string
      ResponseDescription?: string
      errorMessage?: string
    }

    if (!res.ok || !body.CheckoutRequestID) {
      logger.error('M-Pesa STK failed', { status: res.status, body })
      throw new Error(body.errorMessage || body.ResponseDescription || 'STK push rejected')
    }

    return insertMpesaPaymentIntent({
      intentId,
      tenantId: input.tenantId,
      amount: input.amount,
      phoneNumber: input.phoneNumber,
      orderId: input.orderId,
      description: input.description,
      externalRef: body.CheckoutRequestID,
      metadata: {
        ...input.metadata,
        merchant_request_id: body.MerchantRequestID,
        daraja: true,
      },
    })
  } catch (err) {
    logger.error('M-Pesa STK error, falling back to stub', {
      error: err instanceof Error ? err.message : String(err),
    })
    return initiateStkPushStub(input)
  }
}

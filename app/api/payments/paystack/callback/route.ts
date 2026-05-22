import { NextRequest, NextResponse } from 'next/server'
import { handlePaystackCallback } from '@/lib/modules/integrations/paystack-callback'
import { logWebhookEvent, markWebhookEvent } from '@/lib/modules/platform/webhook-events'

/** Paystack redirect + webhook (reference query or JSON body) */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.redirect(new URL('/dashboard/wallet?paystack=missing', request.url))
  }
  const result = await handlePaystackCallback(reference)
  const dest = result.ok
    ? `/dashboard/wallet?payment=${result.paymentIntentId ?? ''}&paystack=ok`
    : `/dashboard/wallet?paystack=failed`
  return NextResponse.redirect(new URL(dest, request.url))
}

export async function POST(request: NextRequest) {
  let reference: string | null = null
  try {
    const body = await request.json()
    reference =
      body?.data?.reference ??
      body?.reference ??
      request.nextUrl.searchParams.get('reference')
    const eventId = await logWebhookEvent({
      provider: 'paystack',
      eventType: body?.event ?? 'webhook',
      externalId: reference,
      payload: body,
    })
    if (!reference) {
      await markWebhookEvent(eventId, 'failed', 'No reference')
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const result = await handlePaystackCallback(reference)
    await markWebhookEvent(eventId, result.ok ? 'processed' : 'failed')
    return NextResponse.json({ ok: result.ok })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

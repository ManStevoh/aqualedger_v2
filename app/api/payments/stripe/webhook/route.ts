import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { applyStripeSubscriptionPlan } from '@/lib/modules/integrations/stripe-billing'
import { logWebhookEvent, markWebhookEvent } from '@/lib/modules/platform/webhook-events'
import type { TenantPlan } from '@/lib/tenant'

export const runtime = 'nodejs'

function parseStripeEvent(body: string): {
  type: string
  data?: { object?: Record<string, unknown> }
} {
  return JSON.parse(body) as { type: string; data?: { object?: Record<string, unknown> } }
}

/** Stripe billing webhooks — subscription checkout + invoice events */
export async function POST(request: NextRequest) {
  const raw = await request.text()
  let event: ReturnType<typeof parseStripeEvent>
  try {
    event = parseStripeEvent(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventId = await logWebhookEvent({
    provider: 'stripe',
    eventType: event.type,
    externalId: (event.data?.object?.id as string) ?? null,
    payload: event,
  })

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object ?? {}
      const meta = session.metadata as Record<string, string> | undefined
      const tenantId = meta?.tenant_id
      const plan = meta?.plan as TenantPlan | undefined
      const subId = session.subscription as string | undefined
      if (tenantId && plan) {
        await applyStripeSubscriptionPlan(tenantId, plan, subId)
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const sub = event.data?.object ?? {}
      const meta = sub.metadata as { tenant_id?: string; plan?: string } | undefined
      const tenantId = meta?.tenant_id
      const plan = meta?.plan as TenantPlan | undefined
      if (tenantId && plan) {
        await applyStripeSubscriptionPlan(
          tenantId,
          plan,
          sub.id as string,
          {
            currentPeriodStart: typeof sub.current_period_start === 'number' ? sub.current_period_start : null,
            currentPeriodEnd: typeof sub.current_period_end === 'number' ? sub.current_period_end : null,
            cancelAtPeriodEnd: typeof sub.cancel_at_period_end === 'boolean' ? sub.cancel_at_period_end : null,
            status: sub.status === 'past_due' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'active',
          },
        )
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data?.object ?? {}
      const subId = invoice.subscription as string | undefined
      if (subId) {
        // Set a 7-day grace period on invoice payment failure
        const graceEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await execute(
          `UPDATE tenants SET grace_period_ends_at = ?, updated_at = NOW() WHERE JSON_UNQUOTE(JSON_EXTRACT(settings, '$.stripe_subscription_id')) = ?`,
          [graceEnd, subId],
        )
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data?.object ?? {}
      const meta = sub.metadata as { tenant_id?: string } | undefined
      if (meta?.tenant_id) {
        await execute(
          `UPDATE tenants SET plan = 'trial', status = 'cancelled', updated_at = NOW() WHERE id = ?`,
          [meta.tenant_id],
        )
      }
    }

    await markWebhookEvent(eventId, 'processed')
  } catch (err) {
    await markWebhookEvent(
      eventId,
      'failed',
      err instanceof Error ? err.message : 'Webhook handler failed',
    )
    return NextResponse.json({ received: true, processed: false }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

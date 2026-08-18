import { queryOne, execute } from '@/lib/db'
import { getStripeApiBase } from '@/lib/config/external-apis'
import { getTenant } from '@/lib/modules/tenant/service'
import type { TenantSettings } from '@/lib/modules/tenant/service'
import { logger } from '@/lib/logger'
import type { TenantPlan } from '@/lib/tenant'
import { stripePriceIdForPlan } from '@/lib/platform/tenant-subdomain'

function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

function joinStripePath(path: string): string {
  const base = getStripeApiBase()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function getStripeCustomerId(tenantId: string): Promise<string | null> {
  const tenant = await getTenant(tenantId)
  const customerId = tenant.settings?.stripe_customer_id
  return typeof customerId === 'string' && customerId.trim() ? customerId.trim() : null
}

export async function setStripeCustomerId(tenantId: string, customerId: string): Promise<void> {
  const tenant = await getTenant(tenantId)
  const settings: TenantSettings = { ...(tenant.settings ?? {}), stripe_customer_id: customerId }
  await execute(`UPDATE tenants SET settings = ?, updated_at = NOW() WHERE id = ?`, [
    JSON.stringify(settings),
    tenantId,
  ])
}

async function ensureStripeCustomer(tenantId: string): Promise<string | null> {
  const existing = await getStripeCustomerId(tenantId)
  if (existing) return existing

  const tenant = await getTenant(tenantId)
  const params = new URLSearchParams()
  params.set('name', tenant.name)
  params.set('metadata[tenant_id]', tenantId)
  if (tenant.slug) params.set('metadata[tenant_slug]', tenant.slug)

  const res = await fetch(joinStripePath('/v1/customers'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = (await res.json()) as { id?: string; error?: { message: string } }
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message || `Stripe customer error ${res.status}`)
  }

  await setStripeCustomerId(tenantId, data.id)
  return data.id
}

export interface BillingPortalSessionResult {
  url: string
  stub: boolean
}

export async function createStripeBillingPortalSession(
  tenantId: string,
  returnUrl: string,
): Promise<BillingPortalSessionResult> {
  if (!stripeConfigured()) {
    return {
      url: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}portal=stub`,
      stub: true,
    }
  }

  try {
    const customerId = await ensureStripeCustomer(tenantId)
    if (!customerId) {
      return {
        url: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}portal=stub`,
        stub: true,
      }
    }

    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('return_url', returnUrl)

    const res = await fetch(joinStripePath('/v1/billing_portal/sessions'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = (await res.json()) as { url?: string; error?: { message: string } }
    if (!res.ok || !data.url) {
      throw new Error(data.error?.message || `Stripe portal error ${res.status}`)
    }

    return { url: data.url, stub: false }
  } catch (err) {
    logger.error('Stripe billing portal failed, using stub', {
      tenantId,
      error: err instanceof Error ? err.message : String(err),
    })
    return {
      url: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}portal=stub`,
      stub: true,
    }
  }
}

export interface StripeCheckoutResult {
  url: string
  sessionId: string | null
  stub: boolean
}

export async function createStripeSubscriptionCheckout(
  tenantId: string,
  plan: TenantPlan,
  successUrl: string,
  cancelUrl: string,
): Promise<StripeCheckoutResult> {
  const priceId = stripePriceIdForPlan(plan)
  if (!stripeConfigured() || !priceId) {
    return {
      url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}checkout=stub&plan=${plan}`,
      sessionId: null,
      stub: true,
    }
  }

  const customerId = await ensureStripeCustomer(tenantId)
  const params = new URLSearchParams()
  params.set('mode', 'subscription')
  params.set('customer', customerId!)
  params.set('success_url', successUrl)
  params.set('cancel_url', cancelUrl)
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  params.set('metadata[tenant_id]', tenantId)
  params.set('metadata[plan]', plan)
  params.set('subscription_data[metadata][tenant_id]', tenantId)
  params.set('subscription_data[metadata][plan]', plan)

  const res = await fetch(joinStripePath('/v1/checkout/sessions'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = (await res.json()) as { url?: string; id?: string; error?: { message: string } }
  if (!res.ok || !data.url) {
    throw new Error(data.error?.message || `Stripe checkout error ${res.status}`)
  }

  return { url: data.url, sessionId: data.id ?? null, stub: false }
}

export interface StripeInvoiceRow {
  id: string
  number: string | null
  status: string
  amountDue: number
  currency: string
  created: number
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

export async function listStripeCustomerInvoices(
  tenantId: string,
  limit = 12,
): Promise<StripeInvoiceRow[]> {
  if (!stripeConfigured()) return []
  const customerId = await getStripeCustomerId(tenantId)
  if (!customerId) return []

  const params = new URLSearchParams()
  params.set('customer', customerId)
  params.set('limit', String(Math.min(limit, 24)))

  const res = await fetch(joinStripePath(`/v1/invoices?${params}`), {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  })
  const data = (await res.json()) as {
    data?: Array<{
      id: string
      number: string | null
      status: string
      amount_due: number
      currency: string
      created: number
      hosted_invoice_url: string | null
      invoice_pdf: string | null
    }>
  }

  return (data.data ?? []).map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    amountDue: inv.amount_due / 100,
    currency: inv.currency.toUpperCase(),
    created: inv.created,
    hostedInvoiceUrl: inv.hosted_invoice_url,
    invoicePdf: inv.invoice_pdf,
  }))
}

export async function applyStripeSubscriptionPlan(
  tenantId: string,
  plan: TenantPlan,
  stripeSubscriptionId?: string,
  options?: {
    currentPeriodStart?: Date | number | null
    currentPeriodEnd?: Date | number | null
    cancelAtPeriodEnd?: boolean | null
    status?: string
  },
): Promise<void> {
  const tenant = await getTenant(tenantId)
  const settings: TenantSettings = {
    ...(tenant.settings ?? {}),
    stripe_subscription_id: stripeSubscriptionId ?? tenant.settings?.stripe_subscription_id,
  }

  const updates: string[] = ['plan = ?', 'settings = ?', 'updated_at = NOW()']
  const params: unknown[] = [plan, JSON.stringify(settings)]

  if (options?.currentPeriodStart) {
    updates.push('current_period_start = ?')
    params.push(
      options.currentPeriodStart instanceof Date
        ? options.currentPeriodStart
        : new Date(options.currentPeriodStart * 1000),
    )
  }

  if (options?.currentPeriodEnd) {
    updates.push('current_period_end = ?')
    params.push(
      options.currentPeriodEnd instanceof Date
        ? options.currentPeriodEnd
        : new Date(options.currentPeriodEnd * 1000),
    )
  }

  if (options?.cancelAtPeriodEnd !== undefined && options.cancelAtPeriodEnd !== null) {
    updates.push('cancel_at_period_end = ?')
    params.push(options.cancelAtPeriodEnd ? 1 : 0)
  }

  if (options?.status) {
    updates.push('status = ?')
    params.push(options.status)
  }

  params.push(tenantId)
  await execute(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`, params)
}

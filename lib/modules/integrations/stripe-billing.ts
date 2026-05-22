import { queryOne, execute } from '@/lib/db'
import { getStripeApiBase } from '@/lib/config/external-apis'
import { getTenant } from '@/lib/modules/tenant/service'
import type { TenantSettings } from '@/lib/modules/tenant/service'
import { logger } from '@/lib/logger'

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

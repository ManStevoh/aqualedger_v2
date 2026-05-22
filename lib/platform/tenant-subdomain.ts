import type { TenantPlan } from '@/lib/tenant'

/** Build origin for tenant subdomain storefront, e.g. https://acme.aquaerp.co.ke */
export function buildTenantSubdomainOrigin(slug: string): string {
  const platformHost = (process.env.PLATFORM_HOST || 'localhost').toLowerCase()
  const protocol =
    process.env.APP_PROTOCOL ||
    (platformHost === 'localhost' ? 'http' : 'https')
  const port = process.env.PORT && platformHost === 'localhost' ? `:${process.env.PORT}` : ''
  if (platformHost === 'localhost') {
    return `${protocol}://${slug}.localhost${port}`
  }
  return `${protocol}://${slug}.${platformHost}`
}

export function stripePriceIdForPlan(plan: TenantPlan): string | null {
  const map: Record<TenantPlan, string | undefined> = {
    trial: process.env.STRIPE_PRICE_TRIAL,
    starter: process.env.STRIPE_PRICE_STARTER,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  }
  const id = map[plan]?.trim()
  return id || null
}

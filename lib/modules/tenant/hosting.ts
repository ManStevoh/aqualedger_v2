import { queryOne } from '@/lib/db'
import { listCustomDomains } from '@/lib/modules/tenant/custom-domains'
import {
  buildPlatformStoreUrl,
  buildTenantSubdomainDashboardUrl,
  buildTenantSubdomainHost,
  buildTenantSubdomainOrigin,
  buildTenantSubdomainStoreUrl,
  getAppOrigin,
  getPlatformHost,
} from '@/lib/platform/tenant-url'

export interface TenantHostingInfo {
  slug: string
  tenantName: string
  platformHost: string
  subdomainHost: string
  subdomainUrl: string
  subdomainStoreUrl: string
  subdomainDashboardUrl: string
  platformStoreUrl: string
  cnameTarget: string
  dnsTxtHost: (domain: string) => string
  customDomains: Awaited<ReturnType<typeof listCustomDomains>>
  primaryCustomDomain: string | null
}

export async function getTenantHostingInfo(tenantId: string): Promise<TenantHostingInfo | null> {
  const tenant = await queryOne<{ slug: string; name: string }>(
    `SELECT slug, name FROM tenants WHERE id = ? LIMIT 1`,
    [tenantId],
  )
  if (!tenant) return null

  const customDomains = await listCustomDomains(tenantId)
  type DomainRow = { domain: string; primary_domain?: number | boolean; verified?: number | boolean }
  const rows = customDomains as DomainRow[]
  const primaryRow =
    rows.find((d) => Number(d.primary_domain) === 1) ||
    rows.find((d) => Number(d.verified) === 1)

  return {
    slug: tenant.slug,
    tenantName: tenant.name,
    platformHost: getPlatformHost(),
    subdomainHost: buildTenantSubdomainHost(tenant.slug),
    subdomainUrl: buildTenantSubdomainOrigin(tenant.slug),
    subdomainStoreUrl: buildTenantSubdomainStoreUrl(tenant.slug),
    subdomainDashboardUrl: buildTenantSubdomainDashboardUrl(tenant.slug),
    platformStoreUrl: buildPlatformStoreUrl(tenant.slug),
    cnameTarget: getPlatformHost(),
    dnsTxtHost: (domain) => `_aquaerp-verify.${domain}`,
    customDomains,
    primaryCustomDomain: primaryRow?.domain ?? null,
  }
}

export function hostingSummaryForSlug(slug: string, tenantName: string) {
  return {
    slug,
    tenantName,
    platformHost: getPlatformHost(),
    subdomainHost: buildTenantSubdomainHost(slug),
    subdomainUrl: buildTenantSubdomainOrigin(slug),
    subdomainStoreUrl: buildTenantSubdomainStoreUrl(slug),
    platformStoreUrl: buildPlatformStoreUrl(slug),
    appOrigin: getAppOrigin(),
  }
}

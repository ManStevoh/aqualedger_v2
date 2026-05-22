/**
 * Tenant hosting URLs: default subdomain + storefront paths.
 * Configure PLATFORM_HOST and NEXT_PUBLIC_APP_URL in production.
 */

export function getPlatformHost(): string {
  const explicit = process.env.PLATFORM_HOST?.trim().toLowerCase()
  if (explicit) return explicit.replace(/^https?:\/\//, '').split(':')[0]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
  try {
    return new URL(appUrl).hostname.toLowerCase()
  } catch {
    return 'localhost'
  }
}

export function getAppOrigin(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export function getAppProtocol(): 'http' | 'https' {
  const origin = getAppOrigin()
  return origin.startsWith('https') ? 'https' : 'http'
}

/** Host only: acme.yourplatform.com */
export function buildTenantSubdomainHost(slug: string): string {
  const platformHost = getPlatformHost()
  if (platformHost === 'localhost') {
    return `${slug}.localhost`
  }
  return `${slug}.${platformHost}`
}

/** Full origin for tenant subdomain */
export function buildTenantSubdomainOrigin(slug: string): string {
  const protocol = getAppProtocol()
  const host = buildTenantSubdomainHost(slug)
  const appUrl = new URL(getAppOrigin())
  const portSuffix =
    appUrl.port && !['80', '443'].includes(appUrl.port) ? `:${appUrl.port}` : ''
  return `${protocol}://${host}${portSuffix}`
}

/** Storefront on tenant subdomain (middleware redirects / → /store/{slug}) */
export function buildTenantSubdomainStoreUrl(slug: string): string {
  return `${buildTenantSubdomainOrigin(slug)}/`
}

/** Storefront on platform apex (always works without DNS) */
export function buildPlatformStoreUrl(slug: string): string {
  return `${getAppOrigin()}/store/${slug}`
}

/** Dashboard deep link on subdomain (same cookies when PLATFORM_HOST configured) */
export function buildTenantSubdomainDashboardUrl(slug: string, path = '/dashboard'): string {
  const base = buildTenantSubdomainOrigin(slug)
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

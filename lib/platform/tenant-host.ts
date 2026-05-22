/** Reserved subdomains that are not tenant slugs */
const RESERVED = new Set(['www', 'app', 'api', 'admin', 'dashboard', 'store', 'login', 'register'])

/** Hosts that must not trigger custom-domain DB lookup (platform apex / local dev). */
export function isSkippablePlatformHost(hostname: string): boolean {
  const h = hostname.split(':')[0].toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return true
  const platformHost = (process.env.PLATFORM_HOST || 'localhost').toLowerCase()
  return h === platformHost || h === `www.${platformHost}`
}

/**
 * Extract tenant slug from Host header (no database).
 * Examples: acme.localhost → acme, acme.aquaerp.co.ke → acme
 */
export function extractTenantSlugFromHost(host: string | null): string | null {
  if (!host) return null
  const hostname = host.split(':')[0].toLowerCase()
  const platformHost = (process.env.PLATFORM_HOST || 'localhost').toLowerCase()

  if (hostname === platformHost || hostname === `www.${platformHost}`) {
    return null
  }

  if (hostname.endsWith(`.${platformHost}`)) {
    const sub = hostname.slice(0, -(platformHost.length + 1))
    if (sub && !sub.includes('.') && !RESERVED.has(sub)) return sub
  }

  const parts = hostname.split('.')
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    const sub = parts[0]
    if (sub && !RESERVED.has(sub)) return sub
  }

  return null
}

/** Rewrite /store/{wrongSlug}/… to /store/{tenantSlug}/… when host resolves to tenantSlug */
export function canonicalStorePath(pathname: string, tenantSlug: string): string | null {
  const match = pathname.match(/^\/store\/([^/]+)(\/.*)?$/)
  if (!match || match[1] === tenantSlug) return null
  return `/store/${tenantSlug}${match[2] ?? ''}`
}

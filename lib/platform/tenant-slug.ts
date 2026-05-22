/** Tenant slug rules for subdomains: {slug}.PLATFORM_HOST */

const RESERVED = new Set([
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'store',
  'login',
  'register',
  'mail',
  'smtp',
  'ftp',
  'cdn',
  'static',
  'assets',
  'help',
  'support',
  'status',
  'billing',
])

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/

export function slugifyOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function validateTenantSlug(input: string): {
  ok: boolean
  normalized: string
  error?: string
} {
  const normalized = slugifyOrganizationName(input)
  if (!normalized || normalized.length < 2) {
    return { ok: false, normalized, error: 'Subdomain must be at least 2 characters' }
  }
  if (normalized.length > 80) {
    return { ok: false, normalized, error: 'Subdomain is too long' }
  }
  if (!SLUG_REGEX.test(normalized)) {
    return {
      ok: false,
      normalized,
      error: 'Use lowercase letters, numbers, and hyphens (not at start/end)',
    }
  }
  if (RESERVED.has(normalized)) {
    return { ok: false, normalized, error: 'This subdomain is reserved' }
  }
  return { ok: true, normalized }
}

export function isReservedTenantSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase())
}

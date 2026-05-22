import { queryOne } from '@/lib/db'
import type { UserRole } from '@/lib/auth'

export { extractTenantSlugFromHost } from '@/lib/platform/tenant-host'

export async function resolveTenantIdBySlug(slug: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM tenants WHERE slug = ? AND status = 'active' LIMIT 1`,
    [slug.toLowerCase()],
  )
  return row?.id ?? null
}

export async function resolveTenantSlugById(tenantId: string): Promise<string | null> {
  const row = await queryOne<{ slug: string }>(
    `SELECT slug FROM tenants WHERE id = ? AND status = 'active' LIMIT 1`,
    [tenantId],
  )
  return row?.slug ?? null
}

export async function resolveTenantIdByCustomDomain(host: string): Promise<string | null> {
  const hostname = host.split(':')[0].toLowerCase()
  const row = await queryOne<{ tenant_id: string }>(
    `SELECT tenant_id FROM tenant_custom_domains
     WHERE domain = ? AND verified = 1
     LIMIT 1`,
    [hostname],
  )
  return row?.tenant_id ?? null
}

export async function userHasTenantAccess(
  userId: string,
  tenantId: string,
  legacyRole: UserRole,
): Promise<boolean> {
  if (legacyRole === 'super_admin') return true
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM tenant_members WHERE user_id = ? AND tenant_id = ? AND status = 'active' LIMIT 1`,
    [userId, tenantId],
  )
  return Boolean(row)
}

/**
 * Resolve active tenant: subdomain/header slug (if allowed) else primary membership.
 */
export async function resolveActiveTenantId(
  userId: string,
  legacyRole: UserRole,
  opts?: { tenantSlug?: string | null; tenantIdHeader?: string | null },
): Promise<string> {
  const { resolveUserTenantId } = await import('@/lib/modules/tenant/service')

  if (opts?.tenantIdHeader) {
    const allowed = await userHasTenantAccess(userId, opts.tenantIdHeader, legacyRole)
    if (allowed) return opts.tenantIdHeader
  }

  if (opts?.tenantSlug) {
    const tid = await resolveTenantIdBySlug(opts.tenantSlug)
    if (tid && (await userHasTenantAccess(userId, tid, legacyRole))) {
      return tid
    }
  }

  return resolveUserTenantId(userId)
}

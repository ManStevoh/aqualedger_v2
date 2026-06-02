import { query, queryOne, execute } from '@/lib/db'
import type { TenantMemberRole } from '@/lib/tenant'
import {
  ROLE_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from './permissions'

/** Portal roles tenants can customize */
export const PORTAL_ROLES = ['vendor', 'customer'] as const
export type PortalRole = (typeof PORTAL_ROLES)[number]

export function isPortalRole(role: string): role is PortalRole {
  return PORTAL_ROLES.includes(role as PortalRole)
}

/** Permissions a tenant may grant/revoke for each portal role */
export const PORTAL_ROLE_ASSIGNABLE: Record<PortalRole, Permission[]> = {
  vendor: [
    'commerce.catalog.read',
    'commerce.catalog.write',
    'commerce.listings.read',
    'commerce.listings.write',
    'commerce.orders.read',
    'commerce.payouts.read',
    'commerce.vendors.read',
    'commerce.reviews.read',
    'commerce.reviews.write',
    'commerce.storefront.read',
    'commerce.storefront.write',
    'commerce.cart.read',
    'commerce.wishlist.read',
    'accounting.wallet.read',
    'notifications.read',
    'auth.sessions.read',
    'auth.sessions.write',
  ],
  customer: [
    'commerce.catalog.read',
    'commerce.coupons.read',
    'commerce.reviews.read',
    'commerce.reviews.write',
    'commerce.loyalty.read',
    'commerce.cart.read',
    'commerce.cart.write',
    'commerce.wishlist.read',
    'commerce.wishlist.write',
    'commerce.checkout.write',
    'commerce.orders.read',
    'commerce.orders.write',
    'commerce.contracts.read',
    'fishing.traceability.read',
    'accounting.wallet.read',
    'accounting.wallet.write',
    'notifications.read',
    'auth.sessions.read',
    'auth.sessions.write',
  ],
}

export function getBuiltInRolePermissions(role: PortalRole): Permission[] {
  const memberRole = role as TenantMemberRole
  return [...(ROLE_PERMISSIONS[memberRole] ?? [])]
}

export function getDefaultPortalPermissions(role: PortalRole): Permission[] {
  const builtIn = new Set(getBuiltInRolePermissions(role))
  return PORTAL_ROLE_ASSIGNABLE[role].filter((p) => builtIn.has(p))
}

function parsePermissionsJson(raw: unknown): Permission[] {
  if (!raw) return []
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(arr)) return []
  const valid = new Set(Object.keys(PERMISSIONS))
  const assignable = new Set<string>()
  for (const role of PORTAL_ROLES) {
    for (const p of PORTAL_ROLE_ASSIGNABLE[role]) assignable.add(p)
  }
  return arr.filter(
    (p): p is Permission =>
      typeof p === 'string' && valid.has(p) && assignable.has(p),
  )
}

export function sanitizePortalPermissions(
  role: PortalRole,
  permissions: string[],
): Permission[] {
  const allowed = new Set(PORTAL_ROLE_ASSIGNABLE[role])
  const defaults = new Set(getDefaultPortalPermissions(role))
  const picked = permissions.filter(
    (p): p is Permission => allowed.has(p as Permission),
  )
  if (picked.length === 0) return [...defaults]
  return picked
}

export async function seedTenantRolePermissions(tenantId: string): Promise<void> {
  for (const role of PORTAL_ROLES) {
    const perms = getDefaultPortalPermissions(role)
    await execute(
      `INSERT INTO tenant_role_permissions (tenant_id, role, permissions)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE permissions = permissions`,
      [tenantId, role, JSON.stringify(perms)],
    )
  }
}

export async function backfillAllTenantRolePermissions(): Promise<number> {
  const tenants = await query<{ id: string }>(`SELECT id FROM tenants WHERE status = 'active'`)
  for (const t of tenants) {
    await seedTenantRolePermissions(t.id)
  }
  return tenants.length
}

export async function getTenantRolePermissions(
  tenantId: string,
  role: TenantMemberRole,
): Promise<Permission[] | null> {
  if (!isPortalRole(role)) return null

  const row = await queryOne<{ permissions: unknown }>(
    `SELECT permissions FROM tenant_role_permissions WHERE tenant_id = ? AND role = ?`,
    [tenantId, role],
  )
  if (row) return parsePermissionsJson(row.permissions)
  return getDefaultPortalPermissions(role)
}

export async function listTenantPortalRoleMaps(tenantId: string) {
  await seedTenantRolePermissions(tenantId)
  const descriptions = PERMISSIONS as Record<string, string>
  const result = []
  for (const role of PORTAL_ROLES) {
    const row = await queryOne<{ permissions: unknown }>(
      `SELECT permissions FROM tenant_role_permissions WHERE tenant_id = ? AND role = ?`,
      [tenantId, role],
    )
    const defaults = getDefaultPortalPermissions(role)
    result.push({
      role,
      label: role === 'vendor' ? 'Vendor (seller portal)' : 'Client (buyer portal)',
      permissions: row ? parsePermissionsJson(row.permissions) : defaults,
      assignable: [...PORTAL_ROLE_ASSIGNABLE[role]],
      defaults,
      descriptions,
    })
  }
  return result
}

export async function updateTenantPortalRolePermissions(
  tenantId: string,
  role: PortalRole,
  permissions: string[],
): Promise<Permission[]> {
  const sanitized = sanitizePortalPermissions(role, permissions)
  await execute(
    `INSERT INTO tenant_role_permissions (tenant_id, role, permissions)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE permissions = VALUES(permissions), updated_at = NOW()`,
    [tenantId, role, JSON.stringify(sanitized)],
  )
  return sanitized
}

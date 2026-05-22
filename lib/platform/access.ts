import { headers } from 'next/headers'
import { queryOne } from '@/lib/db'
import { requireAuth, type JWTPayload, type UserRole } from '@/lib/auth'
import { forbidden } from '@/lib/api-handler'
import { type TenantMemberRole, type TenantContext } from '@/lib/tenant'
import { resolveActiveTenantId } from '@/lib/platform/tenant-resolve'
import {
  hasPermission,
  legacyRoleToMemberRole,
  type Permission,
} from './permissions'
import { getTenantRolePermissions } from './tenant-role-permissions'

export interface AuthContext extends JWTPayload {
  tenantId: string
  memberRole: TenantMemberRole
  /** Tenant-customized portal permissions (vendor/customer); null = use built-in role map */
  rolePermissions: Permission[] | null
}

export async function getTenantMemberRole(
  userId: string,
  tenantId: string,
  legacyRole: UserRole,
): Promise<TenantMemberRole> {
  const row = await queryOne<{ role: TenantMemberRole }>(
    `SELECT role FROM tenant_members WHERE user_id = ? AND tenant_id = ? AND status = 'active' LIMIT 1`,
    [userId, tenantId],
  )
  return row?.role ?? legacyRoleToMemberRole(legacyRole)
}

export async function getAuthContext(): Promise<AuthContext> {
  const auth = await requireAuth()
  const hdrs = await headers()
  const tenantSlug = hdrs.get('x-tenant-slug')
  const tenantIdHeader = hdrs.get('x-tenant-id')
  const tenantId = await resolveActiveTenantId(auth.userId, auth.role, {
    tenantSlug,
    tenantIdHeader,
  })
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)
  const rolePermissions = await getTenantRolePermissions(tenantId, memberRole)
  return { ...auth, tenantId, memberRole, rolePermissions }
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await getAuthContext()
  if (!hasPermission(ctx.memberRole, permission, ctx.role, ctx.rolePermissions)) {
    throw new Error('Forbidden')
  }
  return ctx
}

export function tenantContextFromAuth(ctx: AuthContext): TenantContext {
  return { tenantId: ctx.tenantId, memberRole: ctx.memberRole }
}

/** Super-admin only — platform command center APIs */
export async function requireSuperAdmin(): Promise<JWTPayload> {
  const auth = await requireAuth()
  if (auth.role !== 'super_admin') {
    throw forbidden('Only super administrators can access this resource')
  }
  return auth
}

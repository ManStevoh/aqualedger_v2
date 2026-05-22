import { queryOne } from '@/lib/db'
import { requireAuth, type JWTPayload, type UserRole } from '@/lib/auth'
import { forbidden } from '@/lib/api-handler'
import { type TenantMemberRole, type TenantContext } from '@/lib/tenant'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import {
  hasPermission,
  legacyRoleToMemberRole,
  type Permission,
} from './permissions'

export interface AuthContext extends JWTPayload {
  tenantId: string
  memberRole: TenantMemberRole
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
  const tenantId = await resolveUserTenantId(auth.userId)
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)
  return { ...auth, tenantId, memberRole }
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await getAuthContext()
  if (!hasPermission(ctx.memberRole, permission, ctx.role)) {
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

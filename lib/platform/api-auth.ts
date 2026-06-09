import type { NextRequest } from 'next/server'
import { requireAuth, type JWTPayload } from '@/lib/auth'
import { getTenantMemberRole } from './access'
import { hasPermission, legacyRoleToMemberRole, type Permission } from './permissions'
import { getTenantRolePermissions } from './tenant-role-permissions'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import { forbidden, unauthorized } from '@/lib/api-handler'

import { type TenantMemberRole } from '@/lib/tenant'

export interface ApiAuthContext extends JWTPayload {
  tenantId: string
  memberRole: TenantMemberRole | null
  rolePermissions: Permission[] | null
}

/** Permission-guarded auth for legacy routes migrating off requireRole */
export async function withApiPermission(
  permission: Permission,
): Promise<ApiAuthContext> {
  const auth = await requireAuth()
  const tenantId = await resolveUserTenantId(auth.userId)
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)
  const rolePermissions = await getTenantRolePermissions(tenantId, memberRole)

  if (!memberRole || !hasPermission(memberRole, permission, auth.role, rolePermissions)) {
    throw forbidden()
  }

  return { ...auth, tenantId, memberRole, rolePermissions }
}

/** Allow if the caller has any of the listed permissions */
export async function withApiPermissionAny(
  permissions: Permission[],
): Promise<ApiAuthContext> {
  const auth = await requireAuth()
  const tenantId = await resolveUserTenantId(auth.userId)
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)
  const rolePermissions = await getTenantRolePermissions(tenantId, memberRole)

  if (!memberRole || !permissions.some((p) => hasPermission(memberRole, p, auth.role, rolePermissions))) {
    throw forbidden()
  }

  return { ...auth, tenantId, memberRole, rolePermissions }
}

export function getQueryInt(
  request: NextRequest,
  key: string,
  fallback: number,
  max = 100,
): number {
  const raw = new URL(request.url).searchParams.get(key)
  const n = parseInt(raw || String(fallback), 10)
  if (Number.isNaN(n) || n < 1) return fallback
  return Math.min(n, max)
}

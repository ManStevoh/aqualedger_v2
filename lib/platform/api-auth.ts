import type { NextRequest } from 'next/server'
import { requireAuth, type JWTPayload } from '@/lib/auth'
import { getTenantMemberRole } from './access'
import { hasPermission, legacyRoleToMemberRole, type Permission } from './permissions'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import { forbidden, unauthorized } from '@/lib/api-handler'

export interface ApiAuthContext extends JWTPayload {
  tenantId: string
  memberRole: ReturnType<typeof legacyRoleToMemberRole>
}

/** Permission-guarded auth for legacy routes migrating off requireRole */
export async function withApiPermission(
  permission: Permission,
): Promise<ApiAuthContext> {
  const auth = await requireAuth()
  const tenantId = await resolveUserTenantId(auth.userId)
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)

  if (!hasPermission(memberRole, permission, auth.role)) {
    throw forbidden()
  }

  return { ...auth, tenantId, memberRole }
}

/** Allow if the caller has any of the listed permissions */
export async function withApiPermissionAny(
  permissions: Permission[],
): Promise<ApiAuthContext> {
  const auth = await requireAuth()
  const tenantId = await resolveUserTenantId(auth.userId)
  const memberRole = await getTenantMemberRole(auth.userId, tenantId, auth.role)

  if (!permissions.some((p) => hasPermission(memberRole, p, auth.role))) {
    throw forbidden()
  }

  return { ...auth, tenantId, memberRole }
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

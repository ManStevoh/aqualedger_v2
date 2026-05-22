import { queryOne, execute, generateId } from '@/lib/db'
import { conflict } from '@/lib/api-handler'
import type { TenantMemberRole } from '@/lib/tenant'

export async function ensureTenantMember(
  tenantId: string,
  userId: string,
  role: Extract<TenantMemberRole, 'vendor' | 'customer'>,
  branchId?: string | null,
): Promise<{ memberId: string; created: boolean }> {
  const existing = await queryOne<{ id: string; role: string; status: string }>(
    `SELECT id, role, status FROM tenant_members
     WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, userId],
  )

  if (existing) {
    if (existing.status !== 'active') {
      await execute(
        `UPDATE tenant_members SET status = 'active', role = ?, updated_at = NOW() WHERE id = ?`,
        [role, existing.id],
      )
    } else if (existing.role !== role) {
      await execute(
        `UPDATE tenant_members SET role = ?, updated_at = NOW() WHERE id = ?`,
        [role, existing.id],
      )
    }
    return { memberId: existing.id, created: false }
  }

  const memberId = generateId()
  await execute(
    `INSERT INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [memberId, tenantId, userId, branchId ?? null, role],
  )
  return { memberId, created: true }
}

export async function getTenantMemberRoleForUser(
  tenantId: string,
  userId: string,
): Promise<TenantMemberRole | null> {
  const row = await queryOne<{ role: TenantMemberRole }>(
    `SELECT role FROM tenant_members WHERE tenant_id = ? AND user_id = ? AND status = 'active'`,
    [tenantId, userId],
  )
  return row?.role ?? null
}

export async function assertPortalLoginAllowed(
  tenantId: string,
  userId: string,
): Promise<TenantMemberRole> {
  const role = await getTenantMemberRoleForUser(tenantId, userId)
  if (!role) {
    throw conflict('No active membership for this organization. Ask your admin for a portal invite.')
  }
  if (role !== 'vendor' && role !== 'customer') {
    return role
  }
  return role
}

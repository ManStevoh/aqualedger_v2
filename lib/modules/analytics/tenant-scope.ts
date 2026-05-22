import type { UserRole } from '@/lib/types'

/** Scope analytics to tenant for all roles except platform super_admin */
export function analyticsTenantScope(role: UserRole, tenantId: string): boolean {
  return Boolean(tenantId) && role !== 'super_admin'
}

export function pushAnalyticsTenant(
  conditions: string[],
  params: unknown[],
  alias: string,
  tenantId: string,
): void {
  conditions.push(`${alias}.tenant_id = ?`)
  params.push(tenantId)
}

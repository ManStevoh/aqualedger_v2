import { forbidden, notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'

/** Build AND clause for tenant isolation */
export function tenantFilter(alias: string, tenantId: string): { sql: string; param: string } {
  return { sql: tenantWhere(alias), param: tenantId }
}

export function pushTenantCondition(
  conditions: string[],
  params: unknown[],
  alias: string,
  tenantId: string,
): void {
  conditions.push(tenantWhere(alias))
  params.push(tenantId)
}

/** Ensure row belongs to tenant before update/delete */
export function assertTenantMatch<T extends { tenant_id?: string | null }>(
  row: T | null | undefined,
  tenantId: string,
  label = 'Resource',
): asserts row is T {
  if (!row) throw notFound(`${label} not found`)
  if (row.tenant_id && row.tenant_id !== tenantId) throw forbidden()
}

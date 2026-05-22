/**
 * AquaERP multi-tenant context (Phase 1).
 * All business queries should eventually scope by tenantId.
 */

export const DEFAULT_TENANT_ID = 'tenant-default-0001'

export type TenantPlan = 'trial' | 'starter' | 'professional' | 'enterprise'
export type TenantStatus = 'active' | 'suspended' | 'pending' | 'cancelled'

export type TenantMemberRole =
  | 'tenant_owner'
  | 'branch_manager'
  | 'accountant'
  | 'procurement_officer'
  | 'warehouse_staff'
  | 'fisherman'
  | 'vendor'
  | 'delivery_staff'
  | 'customer'
  | 'hr_officer'
  | 'bmu_official'

export interface Tenant {
  id: string
  slug: string
  name: string
  default_currency: string
  country_code: string
  plan: TenantPlan
  status: TenantStatus
}

export interface TenantContext {
  tenantId: string
  branchId?: string | null
  memberRole?: TenantMemberRole
}

/** SQL fragment helper — use with params [tenantId, ...] */
export function tenantWhere(alias = ''): string {
  const col = alias ? `${alias}.tenant_id` : 'tenant_id'
  return `${col} = ?`
}

/**
 * Until all tables have tenant_id, use default tenant.
 * Phase 1b migrations add tenant_id per domain table.
 */
export function resolveTenantId(tenantId?: string | null): string {
  return tenantId || process.env.DEFAULT_TENANT_ID || DEFAULT_TENANT_ID
}

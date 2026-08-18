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
  trial_starts_at?: string | Date | null
  trial_ends_at?: string | Date | null
  current_period_start?: string | Date | null
  current_period_end?: string | Date | null
  cancel_at_period_end?: boolean | number | null
  grace_period_ends_at?: string | Date | null
  created_at?: string | Date | null
}

export interface TenantExpiryStatus {
  isTrial: boolean
  isTrialExpired: boolean
  isSubscriptionExpired: boolean
  inGracePeriod: boolean
  isSuspendedOrCancelled: boolean
  daysRemaining: number | null
  canWrite: boolean
  displayMessage: string
}

export function getTenantExpiryStatus(tenant: Partial<Tenant>): TenantExpiryStatus {
  const now = new Date()
  const isTrial = tenant.plan === 'trial'
  const isSuspendedOrCancelled = tenant.status === 'suspended' || tenant.status === 'cancelled'

  let isTrialExpired = false
  let isSubscriptionExpired = false
  let inGracePeriod = false
  let daysRemaining: number | null = null

  if (isTrial) {
    if (tenant.trial_ends_at) {
      const trialEnd = new Date(tenant.trial_ends_at)
      const diffMs = trialEnd.getTime() - now.getTime()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      if (diffMs <= 0) {
        isTrialExpired = true
      }
    } else if (tenant.created_at) {
      // Default 14-day trial from tenant creation
      const createdAt = new Date(tenant.created_at)
      const trialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
      const diffMs = trialEnd.getTime() - now.getTime()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      if (diffMs <= 0) {
        isTrialExpired = true
      }
    }
  } else {
    // Paid plans (starter, professional, enterprise)
    if (tenant.current_period_end) {
      const periodEnd = new Date(tenant.current_period_end)
      const diffMs = periodEnd.getTime() - now.getTime()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

      if (diffMs <= 0) {
        // Check if grace period is active
        if (tenant.grace_period_ends_at) {
          const graceEnd = new Date(tenant.grace_period_ends_at)
          if (now <= graceEnd) {
            inGracePeriod = true
          } else {
            isSubscriptionExpired = true
          }
        } else {
          isSubscriptionExpired = true
        }
      }
    }
  }

  const canWrite = !isSuspendedOrCancelled && !isTrialExpired && !isSubscriptionExpired

  let displayMessage = 'Subscription Active'
  if (isSuspendedOrCancelled) {
    displayMessage = `Account ${tenant.status}`
  } else if (isTrialExpired) {
    displayMessage = 'Trial Expired — Please upgrade to continue'
  } else if (isTrial && daysRemaining !== null) {
    displayMessage = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in Trial`
  } else if (inGracePeriod) {
    displayMessage = 'Payment Past Due — Grace Period Active'
  } else if (isSubscriptionExpired) {
    displayMessage = 'Subscription Expired — Renew now to restore full access'
  } else if (tenant.cancel_at_period_end && daysRemaining !== null) {
    displayMessage = `Subscription cancels in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
  } else if (daysRemaining !== null) {
    displayMessage = `Renews in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
  }

  return {
    isTrial,
    isTrialExpired,
    isSubscriptionExpired,
    inGracePeriod,
    isSuspendedOrCancelled,
    daysRemaining,
    canWrite,
    displayMessage,
  }
}

export interface TenantContext {
  tenantId: string
  branchId?: string | null
  memberRole?: TenantMemberRole | null
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

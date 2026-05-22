import type { TenantPlan } from '@/lib/tenant'
import { queryOne } from '@/lib/db'
import { conflict } from '@/lib/api-handler'

export interface PlanLimits {
  maxUsers: number
  maxProducts: number
  maxBranches: number
  analyticsAdvanced: boolean
  marketplace: boolean
  apiAccess: boolean
}

const LIMITS: Record<TenantPlan, PlanLimits> = {
  trial: {
    maxUsers: 5,
    maxProducts: 50,
    maxBranches: 1,
    analyticsAdvanced: false,
    marketplace: true,
    apiAccess: false,
  },
  starter: {
    maxUsers: 15,
    maxProducts: 500,
    maxBranches: 3,
    analyticsAdvanced: false,
    marketplace: true,
    apiAccess: true,
  },
  professional: {
    maxUsers: 100,
    maxProducts: 5000,
    maxBranches: 20,
    analyticsAdvanced: true,
    marketplace: true,
    apiAccess: true,
  },
  enterprise: {
    maxUsers: 10000,
    maxProducts: 100000,
    maxBranches: 500,
    analyticsAdvanced: true,
    marketplace: true,
    apiAccess: true,
  },
}

export function getPlanLimits(plan: TenantPlan): PlanLimits {
  return LIMITS[plan] ?? LIMITS.trial
}

export async function assertWithinPlanLimits(
  tenantId: string,
  check: 'users' | 'products' | 'branches',
): Promise<void> {
  const tenant = await queryOne<{ plan: TenantPlan }>(
    `SELECT plan FROM tenants WHERE id = ?`,
    [tenantId],
  )
  const limits = getPlanLimits(tenant?.plan ?? 'trial')

  if (check === 'users') {
    const row = await queryOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tenant_members WHERE tenant_id = ? AND status = 'active'`,
      [tenantId],
    )
    if ((row?.c ?? 0) >= limits.maxUsers) {
      throw conflict(`Plan limit: max ${limits.maxUsers} active users. Upgrade your subscription.`)
    }
  }

  if (check === 'products') {
    const row = await queryOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM product_catalog WHERE tenant_id = ?`,
      [tenantId],
    )
    if ((row?.c ?? 0) >= limits.maxProducts) {
      throw conflict(`Plan limit: max ${limits.maxProducts} catalog products.`)
    }
  }

  if (check === 'branches') {
    const row = await queryOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM branches WHERE tenant_id = ? AND status = 'active'`,
      [tenantId],
    )
    if ((row?.c ?? 0) >= limits.maxBranches) {
      throw conflict(`Plan limit: max ${limits.maxBranches} branches.`)
    }
  }
}

export function planDisplayLabel(plan: TenantPlan): string {
  const labels: Record<TenantPlan, string> = {
    trial: 'Trial',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  }
  return labels[plan] ?? plan
}

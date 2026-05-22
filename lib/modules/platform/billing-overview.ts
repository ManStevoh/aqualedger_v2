import { query } from '@/lib/db'
import { getPlanLimits, type PlanLimits } from '@/lib/modules/tenant/plan-limits'
import type { TenantPlan } from '@/lib/modules/platform/tenants-admin'

export interface TenantBillingUsage {
  users: number
  products: number
  branches: number
}

export interface TenantBillingOverLimit {
  users: boolean
  products: boolean
  branches: boolean
  any: boolean
}

export interface TenantBillingRow {
  tenantId: string
  slug: string
  name: string
  plan: TenantPlan
  status: string
  limits: PlanLimits
  usage: TenantBillingUsage
  overLimit: TenantBillingOverLimit
  utilizationPct: {
    users: number
    products: number
    branches: number
  }
}

function pct(used: number, max: number): number {
  return max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
}

export async function listTenantBilling(): Promise<TenantBillingRow[]> {
  const rows = await query<{
    id: string
    slug: string
    name: string
    plan: TenantPlan
    status: string
    user_count: number
    product_count: number
    branch_count: number
  }>(
    `SELECT
       t.id,
       t.slug,
       t.name,
       t.plan,
       t.status,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.tenant_id = t.id AND tm.status = 'active') AS user_count,
       (SELECT COUNT(*) FROM product_catalog pc WHERE pc.tenant_id = t.id) AS product_count,
       (SELECT COUNT(*) FROM branches b WHERE b.tenant_id = t.id AND b.status = 'active') AS branch_count
     FROM tenants t
     ORDER BY t.name ASC`,
  )

  return rows.map((r) => {
    const limits = getPlanLimits(r.plan)
    const usage: TenantBillingUsage = {
      users: Number(r.user_count),
      products: Number(r.product_count),
      branches: Number(r.branch_count),
    }
    const overLimit: TenantBillingOverLimit = {
      users: usage.users >= limits.maxUsers,
      products: usage.products >= limits.maxProducts,
      branches: usage.branches >= limits.maxBranches,
      any:
        usage.users >= limits.maxUsers ||
        usage.products >= limits.maxProducts ||
        usage.branches >= limits.maxBranches,
    }

    return {
      tenantId: r.id,
      slug: r.slug,
      name: r.name,
      plan: r.plan,
      status: r.status,
      limits,
      usage,
      overLimit,
      utilizationPct: {
        users: pct(usage.users, limits.maxUsers),
        products: pct(usage.products, limits.maxProducts),
        branches: pct(usage.branches, limits.maxBranches),
      },
    }
  })
}

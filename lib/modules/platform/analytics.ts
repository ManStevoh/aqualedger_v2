import { query, queryOne } from '@/lib/db'
import { getPlanLimits } from '@/lib/modules/tenant/plan-limits'
import type { TenantPlan } from '@/lib/modules/platform/tenants-admin'

export interface TenantRevenueRow {
  tenantId: string
  tenantName: string
  slug: string
  plan: TenantPlan
  status: string
  orderCount30d: number
  revenue30d: number
  memberCount: number
}

export interface PlanBreakdownRow {
  plan: TenantPlan
  count: number
}

export interface PlatformAnalytics {
  revenue30d: number
  orders30d: number
  paidOrders30d: number
  planBreakdown: PlanBreakdownRow[]
  topTenants: TenantRevenueRow[]
  signupsByDay: { date: string; count: number }[]
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const totals = await queryOne<{
    revenue30d: number
    orders30d: number
    paidOrders30d: number
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total ELSE 0 END), 0) AS revenue30d,
       SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS orders30d,
       SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND payment_status = 'paid') AS paidOrders30d
     FROM orders`,
  )

  const planBreakdown = await query<{ plan: TenantPlan; count: number }>(
    `SELECT plan, COUNT(*) AS count FROM tenants GROUP BY plan ORDER BY count DESC`,
  )

  const topTenants = await query<{
    tenant_id: string
    tenant_name: string
    slug: string
    plan: TenantPlan
    status: string
    order_count_30d: number
    revenue_30d: number
    member_count: number
  }>(
    `SELECT
       t.id AS tenant_id,
       t.name AS tenant_name,
       t.slug,
       t.plan,
       t.status,
       COALESCE(SUM(CASE WHEN o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END), 0) AS order_count_30d,
       COALESCE(SUM(CASE WHEN o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN o.total ELSE 0 END), 0) AS revenue_30d,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.tenant_id = t.id AND tm.status = 'active') AS member_count
     FROM tenants t
     LEFT JOIN orders o ON o.tenant_id = t.id
     GROUP BY t.id, t.name, t.slug, t.plan, t.status
     ORDER BY revenue_30d DESC, order_count_30d DESC
     LIMIT 20`,
  )

  const signupsByDay = await query<{ date: string; count: number }>(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM users
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
  )

  return {
    revenue30d: Number(totals?.revenue30d ?? 0),
    orders30d: Number(totals?.orders30d ?? 0),
    paidOrders30d: Number(totals?.paidOrders30d ?? 0),
    planBreakdown: planBreakdown.map((r) => ({
      plan: r.plan,
      count: Number(r.count),
    })),
    topTenants: topTenants.map((r) => ({
      tenantId: r.tenant_id,
      tenantName: r.tenant_name,
      slug: r.slug,
      plan: r.plan,
      status: r.status,
      orderCount30d: Number(r.order_count_30d),
      revenue30d: Number(r.revenue_30d),
      memberCount: Number(r.member_count),
    })),
    signupsByDay: signupsByDay.map((r) => ({
      date: String(r.date).slice(0, 10),
      count: Number(r.count),
    })),
  }
}

export interface TenantUsageSnapshot {
  tenantId: string
  plan: TenantPlan
  limits: ReturnType<typeof getPlanLimits>
  usage: {
    users: number
    products: number
    branches: number
  }
  utilizationPct: {
    users: number
    products: number
    branches: number
  }
}

export async function getTenantUsage(tenantId: string): Promise<TenantUsageSnapshot | null> {
  const tenant = await queryOne<{ plan: TenantPlan }>(
    `SELECT plan FROM tenants WHERE id = ?`,
    [tenantId],
  )
  if (!tenant) return null

  const limits = getPlanLimits(tenant.plan)
  const usage = await queryOne<{ users: number; products: number; branches: number }>(
    `SELECT
       (SELECT COUNT(*) FROM tenant_members WHERE tenant_id = ? AND status = 'active') AS users,
       (SELECT COUNT(*) FROM product_catalog WHERE tenant_id = ?) AS products,
       (SELECT COUNT(*) FROM branches WHERE tenant_id = ? AND status = 'active') AS branches`,
    [tenantId, tenantId, tenantId],
  )

  const u = {
    users: Number(usage?.users ?? 0),
    products: Number(usage?.products ?? 0),
    branches: Number(usage?.branches ?? 0),
  }

  const pct = (used: number, max: number) =>
    max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0

  return {
    tenantId,
    plan: tenant.plan,
    limits,
    usage: u,
    utilizationPct: {
      users: pct(u.users, limits.maxUsers),
      products: pct(u.products, limits.maxProducts),
      branches: pct(u.branches, limits.maxBranches),
    },
  }
}

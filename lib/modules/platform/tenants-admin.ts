import { query, queryOne, execute } from '@/lib/db'

export type TenantPlan = 'trial' | 'starter' | 'professional' | 'enterprise'
export type TenantStatus = 'active' | 'suspended' | 'pending' | 'cancelled'

export interface TenantWithStats {
  id: string
  slug: string
  name: string
  plan: TenantPlan
  status: TenantStatus
  createdAt: Date
  memberCount: number
  orderCount: number
  catchCount: number
  revenue30d: number
}

export async function listTenantsWithStats(): Promise<TenantWithStats[]> {
  const rows = await query<{
    id: string
    slug: string
    name: string
    plan: TenantPlan
    status: TenantStatus
    created_at: Date
    member_count: number
    order_count: number
    catch_count: number
    revenue_30d: number
  }>(
    `SELECT
       t.id,
       t.slug,
       t.name,
       t.plan,
       t.status,
       t.created_at,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.tenant_id = t.id) AS member_count,
       (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.id) AS order_count,
       (SELECT COUNT(*) FROM catches c WHERE c.tenant_id = t.id) AS catch_count,
       (SELECT COALESCE(SUM(o2.total), 0) FROM orders o2
        WHERE o2.tenant_id = t.id AND o2.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS revenue_30d
     FROM tenants t
     WHERE t.slug != 'default'
     ORDER BY t.created_at DESC`,
  )

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    plan: r.plan,
    status: r.status,
    createdAt: r.created_at,
    memberCount: Number(r.member_count),
    orderCount: Number(r.order_count),
    catchCount: Number(r.catch_count),
    revenue30d: Number(r.revenue_30d),
  }))
}

export async function getTenantDetail(id: string): Promise<(TenantWithStats & { usage: import('./analytics').TenantUsageSnapshot | null }) | null> {
  const row = await queryOne<{
    id: string
    slug: string
    name: string
    plan: TenantPlan
    status: TenantStatus
    created_at: Date
    member_count: number
    order_count: number
    catch_count: number
    revenue_30d: number
  }>(
    `SELECT
       t.id,
       t.slug,
       t.name,
       t.plan,
       t.status,
       t.created_at,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.tenant_id = t.id) AS member_count,
       (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.id) AS order_count,
       (SELECT COUNT(*) FROM catches c WHERE c.tenant_id = t.id) AS catch_count,
       (SELECT COALESCE(SUM(o2.total), 0) FROM orders o2
        WHERE o2.tenant_id = t.id AND o2.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS revenue_30d
     FROM tenants t
     WHERE t.id = ?
     LIMIT 1`,
    [id],
  )
  if (!row) return null

  const { getTenantUsage } = await import('./analytics')
  const usage = await getTenantUsage(id)

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
    memberCount: Number(row.member_count),
    orderCount: Number(row.order_count),
    catchCount: Number(row.catch_count),
    revenue30d: Number(row.revenue_30d),
    usage,
  }
}

export async function updateTenant(
  id: string,
  patch: { status?: TenantStatus; plan?: TenantPlan },
): Promise<TenantWithStats | null> {
  const sets: string[] = []
  const params: unknown[] = []

  if (patch.status) {
    sets.push('status = ?')
    params.push(patch.status)
  }
  if (patch.plan) {
    sets.push('plan = ?')
    params.push(patch.plan)
  }
  if (!sets.length) {
    const existing = await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE id = ?`, [id])
    if (!existing) return null
  } else {
    params.push(id)
    const result = await execute(
      `UPDATE tenants SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    )
    if (result.affectedRows === 0) return null
  }

  const row = await queryOne<{
    id: string
    slug: string
    name: string
    plan: TenantPlan
    status: TenantStatus
    created_at: Date
    member_count: number
    order_count: number
    catch_count: number
    revenue_30d: number
  }>(
    `SELECT
       t.id,
       t.slug,
       t.name,
       t.plan,
       t.status,
       t.created_at,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.tenant_id = t.id) AS member_count,
       (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.id) AS order_count,
       (SELECT COUNT(*) FROM catches c WHERE c.tenant_id = t.id) AS catch_count,
       (SELECT COALESCE(SUM(o2.total), 0) FROM orders o2
        WHERE o2.tenant_id = t.id AND o2.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS revenue_30d
     FROM tenants t
     WHERE t.id = ?
     LIMIT 1`,
    [id],
  )

  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    plan: row.plan,
    status: row.status,
    createdAt: row.created_at,
    memberCount: Number(row.member_count),
    orderCount: Number(row.order_count),
    catchCount: Number(row.catch_count),
    revenue30d: Number(row.revenue_30d),
  }
}

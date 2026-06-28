import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function calculateCooperativeShares(tenantId: string, periodMonth: string) {
  const members = await query<{ user_id: string; catch_kg: number }>(
    `SELECT c.recorded_by as user_id, COALESCE(SUM(c.quantity_kg), 0) as catch_kg
     FROM catches c
     JOIN fishing_trips t ON c.trip_id = t.id
     JOIN boats b ON t.boat_id = b.id
     WHERE b.tenant_id = ?
       AND DATE_FORMAT(c.recorded_at, '%Y-%m') = ?
     GROUP BY c.recorded_by`,
    [tenantId, periodMonth],
  )

  const totalKg = members.reduce((s, m) => s + Number(m.catch_kg), 0)
  const [revenue] = await query<{ total: number }>(
    `SELECT COALESCE(SUM(total_revenue), 0) as total FROM fishing_trips
     WHERE ${tenantWhere()} AND DATE_FORMAT(return_time, '%Y-%m') = ? AND status = 'completed'`,
    [tenantId, periodMonth],
  )
  const pool = Number(revenue?.total ?? 0) * 0.7

  const results = []
  for (const m of members) {
    const kg = Number(m.catch_kg)
    const pct = totalKg > 0 ? (kg / totalKg) * 100 : 0
    const share = totalKg > 0 ? (kg / totalKg) * pool : 0
    const id = generateId()
    await execute(
      `INSERT INTO cooperative_revenue_shares (id, tenant_id, period_month, member_user_id, catch_kg, revenue_share, share_pct, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
       ON DUPLICATE KEY UPDATE catch_kg = VALUES(catch_kg), revenue_share = VALUES(revenue_share), share_pct = VALUES(share_pct)`,
      [id, tenantId, periodMonth, m.user_id, kg, share, pct],
    )
    results.push({ memberUserId: m.user_id, catchKg: kg, sharePct: pct, revenueShare: share })
  }
  return { periodMonth, totalKg, pool, members: results }
}

export async function listCooperativeShares(tenantId: string, periodMonth?: string) {
  const conditions = [tenantWhere('crs.tenant_id')]
  const params: unknown[] = [tenantId]
  if (periodMonth) {
    conditions.push('crs.period_month = ?')
    params.push(periodMonth)
  }
  return query(
    `SELECT crs.*, CONCAT(u.first_name, ' ', u.last_name) as member_name, u.email as member_email
     FROM cooperative_revenue_shares crs
     LEFT JOIN users u ON crs.member_user_id = u.id
     WHERE ${conditions.join(' AND ')} ORDER BY crs.share_pct DESC`,
    params,
  )
}

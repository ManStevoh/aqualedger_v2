import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function computeSupplierScorecards(tenantId: string, periodMonth?: string) {
  const period = periodMonth || new Date().toISOString().slice(0, 7)

  const suppliers = await query<{ id: string; rating: number | null }>(
    `SELECT id, rating FROM suppliers WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )

  let computed = 0
  for (const s of suppliers) {
    const grnStats = await queryOne<{ grn_count: number; on_time: number }>(
      `SELECT COUNT(*) as grn_count,
              SUM(CASE WHEN gr.received_date <= COALESCE(po.expected_date, DATE_ADD(po.created_at, INTERVAL 7 DAY)) THEN 1 ELSE 0 END) as on_time
       FROM goods_receipts gr
       JOIN purchase_orders po ON gr.purchase_order_id = po.id
       WHERE po.supplier_id = ? AND gr.${tenantWhere().replace('tenant_id', 'gr.tenant_id')}
         AND DATE_FORMAT(gr.received_date, '%Y-%m') = ?`,
      [s.id, tenantId, period],
    )

    const grnCount = Number(grnStats?.grn_count ?? 0)
    const onTimePct =
      grnCount > 0 ? Math.round((Number(grnStats?.on_time ?? 0) / grnCount) * 100) : 80
    const qualityScore = Math.min(5, Number(s.rating ?? 3))
    const priceScore = 3.5
    const overall = Math.round(((onTimePct / 100) * 5 * 0.4 + qualityScore * 0.35 + priceScore * 0.25) * 100) / 100

    await execute(
      `INSERT INTO supplier_scorecards (
        id, tenant_id, supplier_id, period_month, on_time_pct, quality_score, price_score, overall_score, grn_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        on_time_pct = VALUES(on_time_pct), quality_score = VALUES(quality_score),
        price_score = VALUES(price_score), overall_score = VALUES(overall_score),
        grn_count = VALUES(grn_count), computed_at = NOW()`,
      [
        generateId(),
        tenantId,
        s.id,
        period,
        onTimePct,
        qualityScore,
        priceScore,
        overall,
        grnCount,
      ],
    )
    computed++
  }

  return { period, computed }
}

export async function listSupplierScorecards(tenantId: string, periodMonth?: string) {
  const period = periodMonth || new Date().toISOString().slice(0, 7)
  return query(
    `SELECT sc.*, s.name as supplier_name
     FROM supplier_scorecards sc
     JOIN suppliers s ON sc.supplier_id = s.id
     WHERE sc.tenant_id = ? AND sc.period_month = ?
     ORDER BY sc.overall_score DESC`,
    [tenantId, period],
  )
}

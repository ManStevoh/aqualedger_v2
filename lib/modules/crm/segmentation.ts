import { query, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function listSegmentRules(tenantId: string) {
  return query(
    `SELECT * FROM crm_segment_rules WHERE ${tenantWhere()} ORDER BY name`,
    [tenantId],
  )
}

export async function upsertSegmentRule(
  tenantId: string,
  input: {
    id?: string
    name: string
    segmentKey: string
    ruleType: 'rfm' | 'order_value' | 'species' | 'manual'
    criteria: Record<string, unknown>
  },
) {
  if (input.id) {
    await execute(
      `UPDATE crm_segment_rules SET name = ?, segment_key = ?, rule_type = ?, criteria = ? WHERE id = ? AND ${tenantWhere()}`,
      [
        input.name,
        input.segmentKey,
        input.ruleType,
        JSON.stringify(input.criteria),
        input.id,
        tenantId,
      ],
    )
    return input.id
  }
  const id = generateId()
  await execute(
    `INSERT INTO crm_segment_rules (id, tenant_id, name, segment_key, rule_type, criteria)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, tenantId, input.name, input.segmentKey, input.ruleType, JSON.stringify(input.criteria)],
  )
  return id
}

export async function computeRfmSegments(tenantId: string) {
  const customers = await query<{
    id: string
    email: string
    segment: string | null
    order_count: number
    total_spent: number
    last_order_days: number | null
  }>(
    `SELECT c.id, c.email, c.segment,
            COUNT(o.id) as order_count,
            COALESCE(SUM(o.total), 0) as total_spent,
            DATEDIFF(NOW(), MAX(o.created_at)) as last_order_days
     FROM crm_customers c
     LEFT JOIN orders o ON o.buyer_id = c.user_id AND o.tenant_id = c.tenant_id AND o.status NOT IN ('cancelled')
     WHERE c.tenant_id = ?
     GROUP BY c.id, c.email, c.segment`,
    [tenantId],
  )

  const segments: { customerId: string; segment: string; score: number }[] = []

  for (const c of customers) {
    const recency = c.last_order_days == null ? 999 : Number(c.last_order_days)
    const frequency = Number(c.order_count)
    const monetary = Number(c.total_spent)

    let segment = 'dormant'
    if (frequency >= 5 && recency <= 30 && monetary >= 50000) segment = 'champion'
    else if (frequency >= 3 && recency <= 60) segment = 'loyal'
    else if (recency <= 14 && frequency <= 1) segment = 'new'
    else if (recency > 90 && frequency >= 2) segment = 'at_risk'
    else if (recency > 180) segment = 'lost'

    const score = Math.round(
      (Math.max(0, 100 - recency) * 0.4 + Math.min(frequency, 10) * 10 * 0.3 + Math.min(monetary / 1000, 100) * 0.3),
    )

    await execute(`UPDATE crm_customers SET rfm_segment = ? WHERE id = ? AND ${tenantWhere()}`, [
      segment,
      c.id,
      tenantId,
    ])
    segments.push({ customerId: c.id, segment, score })
  }

  return { updated: segments.length, segments: segments.slice(0, 100) }
}

export async function getSegmentSummary(tenantId: string) {
  return query<{ segment: string; count: number; revenue: number }>(
    `SELECT COALESCE(c.rfm_segment, c.segment, 'unassigned') as segment,
            COUNT(*) as count,
            COALESCE(SUM(o.total), 0) as revenue
     FROM crm_customers c
     LEFT JOIN orders o ON o.buyer_id = c.user_id AND o.tenant_id = c.tenant_id
     WHERE c.tenant_id = ?
     GROUP BY COALESCE(c.rfm_segment, c.segment, 'unassigned')`,
    [tenantId],
  )
}

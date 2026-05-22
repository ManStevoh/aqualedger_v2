import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { completeWithLlm, getAiModelLabel, isAiLlmEnabled } from './llm'
import { buildTenantAiContext, formatTenantContextForPrompt } from './tenant-context'
import { predictInventoryReorder } from './inventory-prediction'
import { computeDemandForecasts } from './service'
import { computePricePredictions } from './pricing'
import { detectWalletFraud } from './fraud-detection'

export type AiInsightType =
  | 'business_brief'
  | 'coldchain_review'
  | 'inventory_review'
  | 'operations_review'

export interface AiInsight {
  id: string
  tenant_id: string
  insight_type: AiInsightType
  reference_key: string | null
  title: string
  summary: string
  recommendations: string[]
  metrics: Record<string, unknown> | null
  model_version: string
  created_at: string
}

function parseJsonArray(raw: string | unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown
      return Array.isArray(p) ? p.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function ruleBasedBusinessBrief(ctx: Awaited<ReturnType<typeof buildTenantAiContext>>): {
  summary: string
  recommendations: string[]
} {
  const recs: string[] = []
  if (ctx.inventory.critical > 0) {
    recs.push(`Reorder ${ctx.inventory.critical} critical SKU(s): ${ctx.inventory.topReorder.slice(0, 3).join('; ') || 'see Inventory AI'}.`)
  }
  if (Number(ctx.coldchain.openAlerts) > 0) {
    recs.push('Resolve open cold-chain alerts and verify HACCP checklists for affected facilities.')
  }
  if (Number(ctx.commerce.orders30d) === 0 && Number(ctx.operations.trips30d) > 0) {
    recs.push('Catch volume exists but few orders — list fresh inventory on marketplace or contact wholesale CRM leads.')
  }
  if (Number(ctx.finance.glAccounts) < 10) {
    recs.push('Initialize the default chart of accounts under Accounting → General Ledger.')
  }
  if (Number(ctx.crm.pipelineKes) > 50000) {
    recs.push('Follow up on qualified CRM leads to convert pipeline value before spoilage risk.')
  }
  if (recs.length === 0) {
    recs.push('Maintain catch logging, temperature monitoring, and weekly demand forecast refresh.')
  }

  const summary = [
    `Operations (${ctx.periodDays}d): ${ctx.operations.trips30d} trips, ${Number(ctx.operations.catchKg30d).toFixed(0)} kg landed, ${ctx.operations.activeBoats} active vessels.`,
    `Commerce: ${ctx.commerce.orders30d} orders, KES ${Number(ctx.commerce.revenue30d).toLocaleString()} revenue.`,
    `Finance (posted GL): net income KES ${Number(ctx.finance.netIncome).toLocaleString()}.`,
    ctx.alerts.length ? `Attention: ${ctx.alerts.join('; ')}.` : 'No critical cross-module alerts.',
  ].join(' ')

  return { summary, recommendations: recs }
}

export async function saveInsight(
  tenantId: string,
  input: {
    insightType: AiInsightType
    referenceKey?: string
    title: string
    summary: string
    recommendations: string[]
    metrics?: Record<string, unknown>
  },
): Promise<AiInsight> {
  const id = generateId()
  await execute(
    `INSERT INTO ai_insights
     (id, tenant_id, insight_type, reference_key, title, summary, recommendations, metrics, model_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.insightType,
      input.referenceKey ?? null,
      input.title,
      input.summary,
      JSON.stringify(input.recommendations),
      input.metrics ? JSON.stringify(input.metrics) : null,
      getAiModelLabel(),
    ],
  )
  const row = await queryOne<AiInsight & { recommendations: string; metrics: string | null }>(
    `SELECT * FROM ai_insights WHERE id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to save insight')
  return {
    ...row,
    recommendations: parseJsonArray(row.recommendations),
    metrics: row.metrics
      ? (JSON.parse(row.metrics) as Record<string, unknown>)
      : null,
  }
}

export async function getLatestInsight(
  tenantId: string,
  insightType: AiInsightType,
  referenceKey?: string,
): Promise<AiInsight | null> {
  const conditions = [`${tenantWhere()}`, 'insight_type = ?']
  const params: unknown[] = [tenantId, insightType]
  if (referenceKey) {
    conditions.push('reference_key = ?')
    params.push(referenceKey)
  }
  const row = await queryOne<AiInsight & { recommendations: string; metrics: string | null }>(
    `SELECT * FROM ai_insights WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC LIMIT 1`,
    params,
  )
  if (!row) return null
  return {
    ...row,
    recommendations: parseJsonArray(row.recommendations),
    metrics: row.metrics
      ? (JSON.parse(row.metrics) as Record<string, unknown>)
      : null,
  }
}

export async function generateBusinessBrief(tenantId: string): Promise<AiInsight> {
  const ctx = await buildTenantAiContext(tenantId)
  const fallback = ruleBasedBusinessBrief(ctx)

  let summary = fallback.summary
  let recommendations = fallback.recommendations

  if (isAiLlmEnabled()) {
    const system = `You are AquaERP CFO/COO advisor for a fisheries and seafood enterprise in Kenya.
Use ONLY the JSON metrics provided. Be factual, concise, IFRS-aware. Output valid JSON:
{"summary":"2-4 sentences","recommendations":["action1","action2",...]} (3-6 recommendations max).`
    const user = `Tenant metrics:\n${formatTenantContextForPrompt(ctx)}`
    const raw = await completeWithLlm(system, user, { maxTokens: 700 })
    if (raw) {
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        const parsed = JSON.parse(jsonMatch?.[0] ?? raw) as {
          summary?: string
          recommendations?: string[]
        }
        if (parsed.summary) summary = parsed.summary
        if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) {
          recommendations = parsed.recommendations.map(String).slice(0, 8)
        }
      } catch {
        summary = raw.slice(0, 2000)
      }
    }
  }

  return saveInsight(tenantId, {
    insightType: 'business_brief',
    referenceKey: 'daily',
    title: 'AI Business Brief',
    summary,
    recommendations,
    metrics: ctx as unknown as Record<string, unknown>,
  })
}

export async function generateColdchainReview(tenantId: string): Promise<AiInsight> {
  const tw = tenantWhere()
  const [alerts] = await query<{ total: number }>(
    `SELECT COUNT(*) total FROM coldchain_alerts WHERE ${tw} AND resolved=0`,
    [tenantId],
  )
  const recent = await query<{ alert_type: string; severity: string; message: string }>(
    `SELECT alert_type, severity, message FROM coldchain_alerts WHERE ${tw} AND resolved=0
     ORDER BY created_at DESC LIMIT 5`,
    [tenantId],
  )

  const recommendations: string[] = []
  if ((alerts?.total ?? 0) > 0) {
    recommendations.push('Assign technician to verify affected zones within 4 hours.')
    recommendations.push('Complete HACCP checklist for facilities with open alerts.')
  } else {
    recommendations.push('Continue IoT temperature ingest; no open alerts.')
  }

  const summary =
    (alerts?.total ?? 0) > 0
      ? `${alerts?.total} open alert(s): ${recent.map((a) => `${a.severity} ${a.alert_type}`).join(', ')}.`
      : 'Cold chain stable — no unresolved temperature, door, or power alerts.'

  return saveInsight(tenantId, {
    insightType: 'coldchain_review',
    referenceKey: 'latest',
    title: 'Cold Chain AI Review',
    summary,
    recommendations,
    metrics: { openAlerts: alerts?.total ?? 0, samples: recent },
  })
}

export async function generateInventoryReview(tenantId: string): Promise<AiInsight> {
  const rows = await predictInventoryReorder(tenantId)
  const critical = rows.filter((r) => r.urgency === 'critical')
  const low = rows.filter((r) => r.urgency === 'low')

  const recommendations = critical.slice(0, 5).map(
    (r) => `Order ${r.reorderKg} kg of ${r.productName} (${r.sku}) — ~${r.daysOfStock} days stock left.`,
  )
  if (recommendations.length === 0 && low.length > 0) {
    recommendations.push(`Monitor ${low.length} SKU(s) trending low within 7 days.`)
  }
  if (recommendations.length === 0) {
    recommendations.push('Stock levels healthy across active catalog SKUs.')
  }

  return saveInsight(tenantId, {
    insightType: 'inventory_review',
    referenceKey: 'latest',
    title: 'Inventory AI Review',
    summary: `${critical.length} critical, ${low.length} low-stock SKU(s) of ${rows.length} active products.`,
    recommendations,
    metrics: { critical: critical.length, low: low.length, skus: rows.length },
  })
}

/** Daily AI job: refresh models + briefs */
export async function runTenantAiAutomation(tenantId: string): Promise<{
  forecasts: number
  briefId: string
  coldchainId: string
  inventoryId: string
}> {
  const forecasts = await computeDemandForecasts(tenantId)
  await computePricePredictions(tenantId).catch(() => [])
  await detectWalletFraud(tenantId).catch(() => [])

  const brief = await generateBusinessBrief(tenantId)
  const cold = await generateColdchainReview(tenantId)
  const inv = await generateInventoryReview(tenantId)

  return {
    forecasts: forecasts.length,
    briefId: brief.id,
    coldchainId: cold.id,
    inventoryId: inv.id,
  }
}

import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { getLedgerSummary } from '@/lib/modules/accounting/service'
import { predictInventoryReorder } from './inventory-prediction'
import { listDemandForecasts } from './service'
import { detectWalletFraud } from './fraud-detection'

export interface TenantAiContext {
  tenantId: string
  generatedAt: string
  periodDays: number
  operations: Record<string, string | number>
  finance: Record<string, string | number>
  coldchain: Record<string, string | number>
  commerce: Record<string, string | number>
  crm: Record<string, string | number>
  inventory: { critical: number; low: number; topReorder: string[] }
  alerts: string[]
}

const PERIOD_DAYS = 30

export async function buildTenantAiContext(tenantId: string): Promise<TenantAiContext> {
  const tw = tenantWhere()
  const params = [tenantId, PERIOD_DAYS]

  const [boats] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) total, SUM(status='active') active FROM boats WHERE ${tw}`,
    [tenantId],
  )
  const [trips] = await query<{ total: number; catch_kg: number }>(
    `SELECT COUNT(*) total, COALESCE(SUM(total_catch_kg),0) catch_kg
     FROM fishing_trips WHERE ${tw} AND departure_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    params,
  )
  const [orders] = await query<{ total: number; revenue: number }>(
    `SELECT COUNT(*) total, COALESCE(SUM(total),0) revenue FROM orders
     WHERE ${tw} AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    params,
  )
  const [cold] = await query<{ open_alerts: number; readings: number }>(
    `SELECT
      (SELECT COUNT(*) FROM coldchain_alerts WHERE ${tw} AND resolved=0) open_alerts,
      (SELECT COUNT(*) FROM temperature_readings WHERE ${tw}
        AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) readings`,
    params,
  )
  const [leads] = await query<{ total: number; pipeline: number }>(
    `SELECT COUNT(*) total,
      COALESCE(SUM(CASE WHEN stage IN ('new','contacted','qualified') THEN estimated_value ELSE 0 END),0) pipeline
     FROM crm_leads WHERE ${tw}`,
    [tenantId],
  )
  const [expiring] = await query<{ batches: number }>(
    `SELECT COUNT(*) batches FROM inventory_batches ib
     WHERE ${tw} AND status='available' AND expiry_date IS NOT NULL
       AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
    [tenantId],
  )

  let ledger = { revenue: 0, expenses: 0, netIncome: 0, accountCount: 0 }
  try {
    const s = await getLedgerSummary(tenantId)
    ledger = {
      revenue: s.revenue,
      expenses: s.expenses,
      netIncome: s.netIncome,
      accountCount: s.accountCount,
    }
  } catch {
    /* GL may be empty */
  }

  const inventoryRows = await predictInventoryReorder(tenantId)
  const critical = inventoryRows.filter((r) => r.urgency === 'critical')
  const low = inventoryRows.filter((r) => r.urgency === 'low')
  const topReorder = [...critical, ...low]
    .filter((r) => r.reorderKg > 0)
    .slice(0, 5)
    .map((r) => `${r.productName} (+${r.reorderKg} kg, ${r.daysOfStock}d stock)`)

  const forecasts = await listDemandForecasts(tenantId, 7)
  const fraud = await detectWalletFraud(tenantId)

  const alerts: string[] = []
  if ((cold?.open_alerts ?? 0) > 0) {
    alerts.push(`${cold?.open_alerts} open cold-chain alert(s)`)
  }
  if ((expiring?.batches ?? 0) > 0) {
    alerts.push(`${expiring?.batches} inventory batch(es) expiring within 7 days`)
  }
  if (critical.length > 0) {
    alerts.push(`${critical.length} SKU(s) at critical stock levels`)
  }
  if (fraud.length > 0) {
    alerts.push(`${fraud.length} unusual wallet transaction(s) flagged`)
  }
  if ((leads?.total ?? 0) > 0 && Number(leads?.pipeline) > 0) {
    alerts.push(`CRM pipeline KES ${Number(leads?.pipeline).toLocaleString()} across open leads`)
  }

  return {
    tenantId,
    generatedAt: new Date().toISOString(),
    periodDays: PERIOD_DAYS,
    operations: {
      fleetBoats: boats?.total ?? 0,
      activeBoats: boats?.active ?? 0,
      trips30d: trips?.total ?? 0,
      catchKg30d: Number(trips?.catch_kg ?? 0),
      demandSpeciesForecasted: new Set(forecasts.map((f) => f.species_or_sku)).size,
    },
    finance: {
      glAccounts: ledger.accountCount,
      revenuePosted: ledger.revenue,
      expensesPosted: ledger.expenses,
      netIncome: ledger.netIncome,
    },
    coldchain: {
      openAlerts: cold?.open_alerts ?? 0,
      temperatureReadings30d: cold?.readings ?? 0,
    },
    commerce: {
      orders30d: orders?.total ?? 0,
      revenue30d: Number(orders?.revenue ?? 0),
    },
    crm: {
      leads: leads?.total ?? 0,
      pipelineKes: Number(leads?.pipeline ?? 0),
    },
    inventory: {
      critical: critical.length,
      low: low.length,
      topReorder,
    },
    alerts,
  }
}

export function formatTenantContextForPrompt(ctx: TenantAiContext): string {
  return JSON.stringify(
    {
      period: `last ${ctx.periodDays} days`,
      operations: ctx.operations,
      finance: ctx.finance,
      coldchain: ctx.coldchain,
      commerce: ctx.commerce,
      crm: ctx.crm,
      inventory: ctx.inventory,
      priorityAlerts: ctx.alerts,
    },
    null,
    2,
  )
}

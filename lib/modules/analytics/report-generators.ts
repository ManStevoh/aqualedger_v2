import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import {
  getExecutiveSummary,
  getTraceabilityReport,
  getKpiSummary,
  type KpiRow,
  type TraceabilityLot,
} from './service'
import {
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
} from '@/lib/modules/accounting/service'

export interface ReportMeta {
  reportType: string
  title: string
  generatedAt: string
  periodDays: number
  periodStart: string
  periodEnd: string
  tenantId: string
  standards: string[]
  rowCount: number
}

export interface GeneratedReport {
  meta: ReportMeta
  sections: ReportSection[]
  raw?: unknown
}

export interface ReportSection {
  id: string
  title: string
  columns: string[]
  rows: Record<string, string | number | null>[]
}

function periodBounds(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
    periodDays: days,
  }
}

function meta(
  reportType: string,
  title: string,
  tenantId: string,
  standards: string[],
  rowCount: number,
  days: number,
): ReportMeta {
  const p = periodBounds(days)
  return {
    reportType,
    title,
    generatedAt: new Date().toISOString(),
    ...p,
    tenantId,
    standards,
    rowCount,
  }
}

export async function generateReport(
  tenantId: string,
  reportType: string,
  periodDays = 30,
): Promise<GeneratedReport> {
  switch (reportType) {
    case 'kpi-summary':
      return generateKpi(tenantId, periodDays)
    case 'executive-summary':
      return generateExecutive(tenantId, periodDays)
    case 'traceability':
      return generateTraceability(tenantId, periodDays)
    case 'financial':
      return generateFinancial(tenantId, periodDays)
    case 'profit-loss':
      return generateProfitLoss(tenantId, periodDays)
    case 'trial-balance':
      return generateTrialBalance(tenantId, periodDays)
    case 'commerce-orders':
      return generateCommerce(tenantId, periodDays)
    case 'coldchain-compliance':
      return generateColdchain(tenantId, periodDays)
    case 'procurement':
      return generateProcurement(tenantId, periodDays)
    case 'fishing-operations':
      return generateFishing(tenantId, periodDays)
    default:
      return generateKpi(tenantId, periodDays)
  }
}

async function generateKpi(tenantId: string, days: number): Promise<GeneratedReport> {
  const kpis = await getKpiSummary(tenantId)
  return {
    meta: meta('kpi-summary', 'Executive KPI Summary', tenantId, ['ISO 8601', 'UTF-8 CSV'], kpis.length, days),
    sections: [
      {
        id: 'kpis',
        title: 'Key performance indicators',
        columns: ['metric', 'value', 'unit'],
        rows: kpis.map((k) => ({ metric: k.metric, value: k.value, unit: k.unit })),
      },
    ],
    raw: kpis,
  }
}

async function generateExecutive(tenantId: string, days: number): Promise<GeneratedReport> {
  const s = await getExecutiveSummary(tenantId)
  const rows = [
    { metric: 'Fleet (total)', value: s.fleetCount, unit: 'boats' },
    { metric: 'Fleet (active)', value: s.activeFleetCount, unit: 'boats' },
    { metric: 'Orders', value: s.ordersCount, unit: 'count' },
    { metric: 'Revenue (KES)', value: s.revenueTotal, unit: 'KES' },
    { metric: 'Cold alerts (total)', value: s.coldAlertsCount, unit: 'count' },
    { metric: 'Cold alerts (open)', value: s.openColdAlertsCount, unit: 'count' },
  ]
  return {
    meta: meta('executive-summary', 'Executive Dashboard', tenantId, ['IFRS management'], rows.length, days),
    sections: [{ id: 'summary', title: 'Executive summary', columns: ['metric', 'value', 'unit'], rows }],
    raw: s,
  }
}

async function generateTraceability(tenantId: string, days: number): Promise<GeneratedReport> {
  const lots = await getTraceabilityReport(tenantId)
  return {
    meta: meta('traceability', 'Traceability Report', tenantId, ['EU 1224/2009', 'MSC'], lots.length, days),
    sections: [
      {
        id: 'lots',
        title: 'Traceability lots',
        columns: [
          'lot_code', 'species_name', 'vessel_name', 'landing_site', 'catch_date',
          'grading', 'msc_certified', 'fao_area', 'status', 'catch_qty_kg', 'buyer_name',
        ],
        rows: lots.map((l: TraceabilityLot) => ({
          lot_code: l.lot_code,
          species_name: l.species_name,
          vessel_name: l.vessel_name,
          landing_site: l.landing_site,
          catch_date: l.catch_date,
          grading: l.grading,
          msc_certified: l.msc_certified,
          fao_area: l.fao_area,
          status: l.status,
          catch_qty_kg: l.catch_qty_kg,
          buyer_name: l.buyer_name,
        })),
      },
    ],
    raw: lots,
  }
}

async function generateFinancial(tenantId: string, days: number): Promise<GeneratedReport> {
  const [rev] = await query<{ total: number }>(
    `SELECT COALESCE(SUM(total), 0) as total FROM orders
     WHERE ${tenantWhere()} AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, days],
  )
  const [exp] = await query<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses
     WHERE ${tenantWhere()} AND status = 'approved' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, days],
  )
  const revenue = Number(rev?.total ?? 0)
  const expenses = Number(exp?.total ?? 0)
  const rows = [
    { line: 'Revenue', amount_kes: revenue },
    { line: 'Expenses', amount_kes: expenses },
    { line: 'Net profit', amount_kes: revenue - expenses },
  ]
  return {
    meta: meta('financial', 'Financial Performance', tenantId, ['IFRS', 'ISO 4217'], rows.length, days),
    sections: [{ id: 'pl', title: 'Summary', columns: ['line', 'amount_kes'], rows }],
    raw: { revenue, expenses, net: revenue - expenses },
  }
}

async function generateProfitLoss(tenantId: string, days: number): Promise<GeneratedReport> {
  const pl = await getProfitAndLoss(tenantId)
  const rows = [
    ...pl.revenue.map((line) => ({ account: `${line.code} ${line.name}`, type: 'revenue', amount_kes: line.amount })),
    ...pl.expenses.map((line) => ({ account: `${line.code} ${line.name}`, type: 'expense', amount_kes: line.amount })),
    { account: 'Net income', type: 'total', amount_kes: pl.netIncome },
  ]
  return {
    meta: meta('profit-loss', 'Profit & Loss', tenantId, ['IFRS IAS 1'], rows.length, days),
    sections: [{ id: 'pl', title: 'P&L lines', columns: ['account', 'amount_kes'], rows }],
    raw: pl,
  }
}

async function generateTrialBalance(tenantId: string, days: number): Promise<GeneratedReport> {
  const tb = await getTrialBalance(tenantId)
  const rows = (tb.rows || []).map((a) => ({
    code: a.code,
    name: a.name,
    debit: a.balanceDebit,
    credit: a.balanceCredit,
  }))
  return {
    meta: meta('trial-balance', 'Trial Balance', tenantId, ['IFRS'], rows.length, days),
    sections: [{ id: 'tb', title: 'Accounts', columns: ['code', 'name', 'debit', 'credit'], rows }],
    raw: tb,
  }
}

async function generateCommerce(tenantId: string, days: number): Promise<GeneratedReport> {
  const orders = await query<Record<string, unknown>>(
    `SELECT order_number, status, payment_status, subtotal, tax, total, guest_email, created_at
     FROM orders WHERE ${tenantWhere()} AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY created_at DESC LIMIT 500`,
    [tenantId, days],
  )
  return {
    meta: meta('commerce-orders', 'Commerce Orders', tenantId, ['ISO 4217'], orders.length, days),
    sections: [
      {
        id: 'orders',
        title: 'Orders',
        columns: ['order_number', 'status', 'payment_status', 'subtotal', 'tax', 'total', 'guest_email', 'created_at'],
        rows: orders as Record<string, string | number | null>[],
      },
    ],
    raw: orders,
  }
}

async function generateColdchain(tenantId: string, days: number): Promise<GeneratedReport> {
  const alerts = await query<Record<string, unknown>>(
    `SELECT id, zone_id, severity, message, resolved, created_at
     FROM coldchain_alerts WHERE ${tenantWhere()}
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY created_at DESC LIMIT 200`,
    [tenantId, days],
  )
  return {
    meta: meta('coldchain-compliance', 'Cold Chain Compliance', tenantId, ['HACCP', 'FSMA'], alerts.length, days),
    sections: [
      {
        id: 'alerts',
        title: 'Temperature alerts',
        columns: ['id', 'zone_id', 'severity', 'message', 'resolved', 'created_at'],
        rows: alerts as Record<string, string | number | null>[],
      },
    ],
    raw: alerts,
  }
}

async function generateProcurement(tenantId: string, days: number): Promise<GeneratedReport> {
  const pos = await query<Record<string, unknown>>(
    `SELECT po_number, status, total_amount, supplier_id, created_at
     FROM purchase_orders WHERE ${tenantWhere()}
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY created_at DESC LIMIT 200`,
    [tenantId, days],
  )
  return {
    meta: meta('procurement', 'Procurement Summary', tenantId, ['ISO 9001'], pos.length, days),
    sections: [
      {
        id: 'pos',
        title: 'Purchase orders',
        columns: ['po_number', 'status', 'total_amount', 'supplier_id', 'created_at'],
        rows: pos as Record<string, string | number | null>[],
      },
    ],
    raw: pos,
  }
}

async function generateFishing(tenantId: string, days: number): Promise<GeneratedReport> {
  const trips = await query<Record<string, unknown>>(
    `SELECT id, boat_id, status, total_catch_kg, total_revenue, departure_time, return_time
     FROM fishing_trips WHERE ${tenantWhere()}
     AND departure_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY departure_time DESC LIMIT 200`,
    [tenantId, days],
  )
  return {
    meta: meta('fishing-operations', 'Fishing Operations', tenantId, ['FAO', 'ISO 8601'], trips.length, days),
    sections: [
      {
        id: 'trips',
        title: 'Fishing trips',
        columns: ['id', 'boat_id', 'status', 'total_catch_kg', 'total_revenue', 'departure_time', 'return_time'],
        rows: trips as Record<string, string | number | null>[],
      },
    ],
    raw: trips,
  }
}

export function flattenReportToRows(report: GeneratedReport): { headers: string[]; rows: string[][] } {
  const section = report.sections[0]
  if (!section) return { headers: [], rows: [] }
  const headers = section.columns
  const rows = section.rows.map((r) =>
    headers.map((h) => {
      const v = r[h]
      return v == null ? '' : String(v)
    }),
  )
  return { headers, rows }
}

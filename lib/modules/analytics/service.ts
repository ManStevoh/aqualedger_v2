import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface TraceabilityLot {
  id: string
  lot_code: string
  species_name: string | null
  vessel_name: string | null
  landing_site: string | null
  catch_date: string | null
  grading: string | null
  msc_certified: number
  fao_area: string | null
  status: string
  catch_qty_kg: number | null
  buyer_name: string | null
}

export interface KpiRow {
  metric: string
  value: string
  unit: string
}

export interface ExecutiveSummary {
  fleetCount: number
  activeFleetCount: number
  ordersCount: number
  revenueTotal: number
  coldAlertsCount: number
  openColdAlertsCount: number
}

export async function getExecutiveSummary(tenantId: string): Promise<ExecutiveSummary> {
  const [fleet] = await query<{ total: number; active: number }>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
     FROM boats
     WHERE ${tenantWhere()}`,
    [tenantId],
  )

  const [orders] = await query<{ total: number; revenue: number }>(
    `SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as revenue
     FROM orders
     WHERE ${tenantWhere()}`,
    [tenantId],
  )

  const [coldAlerts] = await query<{ total: number; open: number }>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END) as open
     FROM coldchain_alerts
     WHERE ${tenantWhere()}`,
    [tenantId],
  )

  return {
    fleetCount: fleet?.total ?? 0,
    activeFleetCount: Number(fleet?.active) || 0,
    ordersCount: orders?.total ?? 0,
    revenueTotal: Number(orders?.revenue ?? 0),
    coldAlertsCount: coldAlerts?.total ?? 0,
    openColdAlertsCount: Number(coldAlerts?.open) || 0,
  }
}

export async function getTraceabilityReport(tenantId: string): Promise<TraceabilityLot[]> {
  return query<TraceabilityLot>(
    `SELECT
       tl.id,
       tl.lot_code,
       tl.species_name,
       tl.vessel_name,
       tl.landing_site,
       tl.catch_date,
       tl.grading,
       tl.msc_certified,
       tl.fao_area,
       tl.status,
       c.quantity_kg as catch_qty_kg,
       fa.buyer_name
     FROM traceability_lots tl
     LEFT JOIN catches c ON tl.catch_id = c.id
     LEFT JOIN fish_auctions fa ON fa.lot_code = tl.lot_code AND fa.tenant_id = tl.tenant_id
     WHERE ${tenantWhere('tl')}
     ORDER BY tl.catch_date DESC, tl.lot_code ASC`,
    [tenantId],
  )
}

export async function getKpiSummary(tenantId: string): Promise<KpiRow[]> {
  const [employees] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_employees WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )
  const [leavePending] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM hr_leave_requests WHERE ${tenantWhere()} AND status = 'pending'`,
    [tenantId],
  )
  const [orders] = await query<{ total: number; revenue: number }>(
    `SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as revenue FROM orders WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const [lots] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM traceability_lots WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )
  const [forecasts] = await query<{ total: number }>(
    `SELECT COUNT(DISTINCT species_or_sku) as total
     FROM demand_forecasts
     WHERE ${tenantWhere()} AND forecast_date >= CURDATE()`,
    [tenantId],
  )
  const [webhooks] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM webhook_endpoints WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )
  const [boats] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM boats WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const [coldZones] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM storage_zones WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )
  const [coldAlerts] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM coldchain_alerts WHERE ${tenantWhere()} AND resolved = 0`,
    [tenantId],
  )
  const [procOrders] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM purchase_orders WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const [procSuppliers] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM suppliers WHERE ${tenantWhere()}`,
    [tenantId],
  )

  return [
    { metric: 'Active employees', value: String(employees?.total ?? 0), unit: 'count' },
    { metric: 'Pending leave requests', value: String(leavePending?.total ?? 0), unit: 'count' },
    { metric: 'Orders', value: String(orders?.total ?? 0), unit: 'count' },
    { metric: 'Order revenue', value: String(Number(orders?.revenue ?? 0).toFixed(2)), unit: 'KES' },
    { metric: 'Active traceability lots', value: String(lots?.total ?? 0), unit: 'count' },
    { metric: 'Species forecasted', value: String(forecasts?.total ?? 0), unit: 'count' },
    { metric: 'Active webhooks', value: String(webhooks?.total ?? 0), unit: 'count' },
    { metric: 'Fleet boats', value: String(boats?.total ?? 0), unit: 'count' },
    { metric: 'Active fleet', value: String(boats?.active ?? 0), unit: 'count' },
    { metric: 'Cold chain zones', value: String(coldZones?.total ?? 0), unit: 'count' },
    { metric: 'Open cold chain alerts', value: String(coldAlerts?.total ?? 0), unit: 'count' },
    { metric: 'Purchase orders', value: String(procOrders?.total ?? 0), unit: 'count' },
    { metric: 'Suppliers', value: String(procSuppliers?.total ?? 0), unit: 'count' },
  ]
}

export function exportKpiCsv(kpis: KpiRow[]): string {
  const header = 'metric,value,unit'
  const rows = kpis.map((k) => {
    const metric = `"${k.metric.replace(/"/g, '""')}"`
    const value = `"${String(k.value).replace(/"/g, '""')}"`
    const unit = `"${k.unit.replace(/"/g, '""')}"`
    return `${metric},${value},${unit}`
  })
  return [header, ...rows].join('\n')
}

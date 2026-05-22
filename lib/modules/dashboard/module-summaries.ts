import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import type { ModuleId } from '@/lib/platform/modules'
import { ERP_MODULES } from '@/lib/platform/modules'
import type { ModuleDashboardPayload, ModuleKpi, ModuleTrendSeries, ModuleRecentItem, ModuleAlert } from './types'

const PERIOD_DAYS = 30

function fmtKes(n: number): string {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)
}

function fmtKg(n: number): string {
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`
}

function baseMeta(moduleId: string): Pick<ModuleDashboardPayload, 'moduleId' | 'title' | 'description' | 'standards' | 'periodLabel' | 'refreshedAt'> {
  const mod = ERP_MODULES.find((m) => m.id === moduleId)
  return {
    moduleId,
    title: `${mod?.label ?? moduleId} Dashboard`,
    description: mod?.description ?? 'Operational KPIs and recent activity',
    standards: ['ISO 8601', 'Multi-tenant RBAC', 'Real-time GL & ops data'],
    periodLabel: `Last ${PERIOD_DAYS} days`,
    refreshedAt: new Date().toISOString(),
  }
}

async function fishingDashboard(tenantId: string): Promise<Omit<ModuleDashboardPayload, keyof ReturnType<typeof baseMeta>>> {
  const tw = tenantWhere()
  const [boats] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) total, SUM(status='active') active FROM boats WHERE ${tw}`,
    [tenantId],
  )
  const [trips] = await query<{ total: number; active: number; completed: number; catch_kg: number; revenue: number }>(
    `SELECT COUNT(*) total,
      SUM(status IN ('planned','ongoing')) active,
      SUM(status='completed') completed,
      COALESCE(SUM(total_catch_kg),0) catch_kg,
      COALESCE(SUM(total_revenue),0) revenue
     FROM fishing_trips WHERE ${tw} AND departure_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  )
  const [catches] = await query<{ total: number; qty: number; value: number }>(
    `SELECT COUNT(*) total, COALESCE(SUM(quantity_kg),0) qty, COALESCE(SUM(total_value),0) value
     FROM catches WHERE ${tw} AND catch_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  )
  const [lots] = await query<{ active: number }>(
    `SELECT COUNT(*) active FROM traceability_lots WHERE ${tw} AND status='active'`,
    [tenantId],
  )
  const [auctions] = await query<{ open: number }>(
    `SELECT COUNT(*) open FROM fish_auctions WHERE ${tw} AND status IN ('open','active')`,
    [tenantId],
  )

  const trend = await query<{ d: string; kg: number }>(
    `SELECT DATE(catch_time) d, COALESCE(SUM(quantity_kg),0) kg
     FROM catches WHERE ${tw} AND catch_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(catch_time) ORDER BY d`,
    [tenantId, PERIOD_DAYS],
  )

  const recent = await query<ModuleRecentItem>(
    `SELECT id, CONCAT('Trip ', LEFT(id,8)) title,
      CONCAT(COALESCE(total_catch_kg,0),' kg · ', status) subtitle,
      status, DATE_FORMAT(departure_time,'%Y-%m-%d') date
     FROM fishing_trips WHERE ${tw} ORDER BY departure_time DESC LIMIT 8`,
    [tenantId],
  )

  const kpis: ModuleKpi[] = [
    { id: 'boats', label: 'Fleet vessels', value: boats?.total ?? 0, description: `${boats?.active ?? 0} active` },
    { id: 'trips', label: 'Trips (30d)', value: trips?.total ?? 0, description: `${trips?.completed ?? 0} completed` },
    { id: 'catch', label: 'Catch landed', value: fmtKg(Number(catches?.qty ?? 0)), severity: 'success' as const },
    { id: 'revenue', label: 'Trip revenue', value: fmtKes(Number(trips?.revenue ?? 0)) },
    { id: 'lots', label: 'Traceability lots', value: lots?.active ?? 0, href: '/dashboard/traceability' },
    { id: 'auctions', label: 'Open auctions', value: auctions?.open ?? 0, href: '/dashboard/fishing/auctions' },
  ]

  const alerts: ModuleAlert[] = []
  if ((trips?.active ?? 0) > 0) {
    alerts.push({ message: `${trips?.active} trip(s) in progress`, severity: 'info', href: '/dashboard/trips' })
  }

  return {
    kpis,
    trends: [{ id: 'catch', name: 'Daily catch (kg)', points: trend.map((t) => ({ label: String(t.d), value: Number(t.kg) })) }],
    recent: recent.map((r) => ({ ...r, href: `/dashboard/trips` })),
    alerts,
    quickLinks: [
      { label: 'Log catch', href: '/dashboard/catches' },
      { label: 'Fleet', href: '/dashboard/fleet' },
      { label: 'Traceability', href: '/dashboard/traceability' },
      { label: 'Yield forecast', href: '/dashboard/fishing/forecast' },
    ],
  }
}

async function commerceDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [orders] = await query<{ total: number; revenue: number; pending: number; paid: number }>(
    `SELECT COUNT(*) total, COALESCE(SUM(total),0) revenue,
      SUM(payment_status='unpaid') pending, SUM(payment_status='paid') paid
     FROM orders WHERE ${tw} AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  )
  const [listings] = await query<{ active: number }>(
    `SELECT COUNT(*) active FROM fish_listings WHERE ${tw} AND status='active'`,
    [tenantId],
  )
  const [returns] = await query<{ open: number }>(
    `SELECT COUNT(*) open FROM order_returns WHERE ${tw} AND status IN ('requested','approved')`,
    [tenantId],
  ).catch(() => [{ open: 0 }])

  const trend = await query<{ d: string; v: number }>(
    `SELECT DATE(created_at) d, COALESCE(SUM(total),0) v FROM orders WHERE ${tw}
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY DATE(created_at) ORDER BY d`,
    [tenantId, PERIOD_DAYS],
  )

  const recent = await query<ModuleRecentItem & { total?: number }>(
    `SELECT id, CONCAT('Order ', COALESCE(order_number, LEFT(id,8))) title,
      CONCAT(COALESCE(total,0),' KES · ', status) subtitle, status,
      DATE_FORMAT(created_at,'%Y-%m-%d') date, total
     FROM orders WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'orders', label: 'Orders (30d)', value: orders?.total ?? 0 },
      { id: 'revenue', label: 'Gross revenue', value: fmtKes(Number(orders?.revenue ?? 0)), severity: 'success' as const },
      {
        id: 'pending',
        label: 'Pending payment',
        value: orders?.pending ?? 0,
        severity: (orders?.pending ?? 0) > 0 ? 'warning' : 'default',
      },
      { id: 'listings', label: 'Active listings', value: listings?.active ?? 0, href: '/dashboard/marketplace' },
      { id: 'returns', label: 'Open returns', value: returns?.open ?? 0, href: '/dashboard/commerce/returns' },
    ],
    trends: [{ id: 'revenue', name: 'Daily order revenue', points: trend.map((t) => ({ label: String(t.d), value: Number(t.v) })) }],
    recent: recent.map((r) => ({ ...r, href: `/dashboard/orders` })),
    alerts: (orders?.pending ?? 0) > 5 ? [{ message: `${orders?.pending} orders awaiting payment`, severity: 'warning' as const, href: '/dashboard/orders' }] : [],
    quickLinks: [
      { label: 'Orders', href: '/dashboard/orders' },
      { label: 'Marketplace', href: '/dashboard/marketplace' },
      { label: 'Storefront', href: '/dashboard/commerce/storefront' },
      { label: 'Payouts', href: '/dashboard/commerce/payouts' },
    ],
  }
}

async function inventoryDashboard(tenantId: string) {
  const tw = tenantWhere('ib')
  const [sum] = await query<{ batches: number; qty: number; reserved: number; avail: number }>(
    `SELECT COUNT(*) batches, COALESCE(SUM(quantity_kg),0) qty, COALESCE(SUM(reserved_kg),0) reserved,
      SUM(status='available') avail FROM inventory_batches ib WHERE ${tw}`,
    [tenantId],
  )
  const [expiring] = await query<{ c: number }>(
    `SELECT COUNT(*) c FROM inventory_batches ib WHERE ${tw}
     AND expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status='available'`,
    [tenantId],
  )
  const [frozen] = await query<{ kg: number }>(
    `SELECT COALESCE(SUM(quantity_kg),0) kg FROM inventory_batches ib WHERE ${tw} AND storage_type='frozen'`,
    [tenantId],
  )
  const [fresh] = await query<{ kg: number }>(
    `SELECT COALESCE(SUM(quantity_kg),0) kg FROM inventory_batches ib WHERE ${tw} AND storage_type='fresh'`,
    [tenantId],
  )

  const recent = await query<ModuleRecentItem>(
    `SELECT ib.id, ib.batch_code title, CONCAT(ib.quantity_kg,' kg · ', ib.status) subtitle, ib.status,
      DATE_FORMAT(ib.created_at,'%Y-%m-%d') date
     FROM inventory_batches ib WHERE ${tw} ORDER BY ib.created_at DESC LIMIT 8`,
    [tenantId],
  )

  const alerts: ModuleAlert[] = []
  if ((expiring?.c ?? 0) > 0) {
    alerts.push({ message: `${expiring?.c} batch(es) expiring within 7 days`, severity: 'warning', href: '/dashboard/inventory/batches' })
  }

  return {
    kpis: [
      { id: 'batches', label: 'Active batches', value: sum?.batches ?? 0 },
      { id: 'stock', label: 'Total stock', value: fmtKg(Number(sum?.qty ?? 0)) },
      { id: 'available', label: 'Available batches', value: sum?.avail ?? 0, severity: 'success' },
      { id: 'reserved', label: 'Reserved', value: fmtKg(Number(sum?.reserved ?? 0)) },
      { id: 'frozen', label: 'Frozen stock', value: fmtKg(Number(frozen?.kg ?? 0)) },
      { id: 'fresh', label: 'Fresh stock', value: fmtKg(Number(fresh?.kg ?? 0)) },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/inventory/batches' })),
    alerts,
    quickLinks: [
      { label: 'Stock', href: '/dashboard/inventory' },
      { label: 'Batches', href: '/dashboard/inventory/batches' },
      { label: 'Scan', href: '/dashboard/inventory/scan' },
      { label: 'Traceability', href: '/dashboard/inventory/traceability' },
    ],
  }
}

async function coldchainDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [facilities] = await query<{ total: number }>(`SELECT COUNT(*) total FROM storage_facilities WHERE ${tw}`, [tenantId])
  const [zones] = await query<{ total: number }>(`SELECT COUNT(*) total FROM storage_zones WHERE ${tw} AND status='active'`, [tenantId])
  const [alerts] = await query<{ total: number; open: number }>(
    `SELECT COUNT(*) total, SUM(resolved=0) open FROM coldchain_alerts WHERE ${tw}`,
    [tenantId],
  )
  const [readings] = await query<{ breaches: number }>(
    `SELECT COUNT(*) breaches FROM coldchain_alerts WHERE ${tw}
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND severity IN ('warning','critical')`,
    [tenantId, PERIOD_DAYS],
  ).catch(() => [{ breaches: 0 }])

  const recent = await query<ModuleRecentItem>(
    `SELECT id, alert_type title, message subtitle, severity status,
      DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') date
     FROM coldchain_alerts WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  ).catch(() => [])

  return {
    kpis: [
      { id: 'facilities', label: 'Cold facilities', value: facilities?.total ?? 0 },
      { id: 'zones', label: 'Active zones', value: zones?.total ?? 0 },
      { id: 'open', label: 'Open alerts', value: Number(alerts?.open ?? 0), severity: (alerts?.open ?? 0) > 0 ? 'critical' : 'success', href: '/dashboard/coldchain/alerts' },
      { id: 'breaches', label: 'Temp breaches (30d)', value: readings?.breaches ?? 0, severity: (readings?.breaches ?? 0) > 0 ? 'warning' : 'default' },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/coldchain/alerts' })),
    alerts: (alerts?.open ?? 0) > 0 ? [{ message: `${alerts?.open} unresolved cold-chain alert(s)`, severity: 'critical' as const, href: '/dashboard/coldchain/alerts' }] : [],
    quickLinks: [
      { label: 'Facilities', href: '/dashboard/storage' },
      { label: 'HACCP', href: '/dashboard/coldchain/haccp' },
      { label: 'Alerts', href: '/dashboard/coldchain/alerts' },
    ],
  }
}

async function procurementDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [pos] = await query<{ total: number; open: number; value: number }>(
    `SELECT COUNT(*) total, SUM(status IN ('draft','sent','partial')) open, COALESCE(SUM(total_amount),0) value
     FROM purchase_orders WHERE ${tw}`,
    [tenantId],
  )
  const [suppliers] = await query<{ total: number }>(`SELECT COUNT(*) total FROM suppliers WHERE ${tw}`, [tenantId])
  const [grn] = await query<{ pending: number }>(
    `SELECT COUNT(*) pending FROM goods_receipts WHERE ${tw} AND status='pending'`,
    [tenantId],
  ).catch(() => [{ pending: 0 }])

  const recent = await query<ModuleRecentItem>(
    `SELECT id, po_number title, CONCAT(status,' · ', COALESCE(total_amount,0),' KES') subtitle, status,
      DATE_FORMAT(created_at,'%Y-%m-%d') date FROM purchase_orders WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'pos', label: 'Purchase orders', value: pos?.total ?? 0 },
      { id: 'open', label: 'Open POs', value: pos?.open ?? 0, href: '/dashboard/procurement/orders' },
      { id: 'value', label: 'PO value (total)', value: fmtKes(Number(pos?.value ?? 0)) },
      { id: 'suppliers', label: 'Suppliers', value: suppliers?.total ?? 0, href: '/dashboard/procurement/suppliers' },
      { id: 'grn', label: 'Pending GRN', value: grn?.pending ?? 0, severity: (grn?.pending ?? 0) > 0 ? 'warning' : 'default' },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/procurement/orders' })),
    alerts: [],
    quickLinks: [
      { label: 'Suppliers', href: '/dashboard/procurement/suppliers' },
      { label: 'Purchase orders', href: '/dashboard/procurement/orders' },
      { label: '3-way match', href: '/dashboard/procurement/match' },
    ],
  }
}

async function crmDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [cust] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) total, SUM(status='active') active FROM crm_customers WHERE ${tw}`,
    [tenantId],
  )
  const [leads] = await query<{ total: number; new: number }>(
    `SELECT COUNT(*) total, SUM(stage='new') new FROM crm_leads WHERE ${tw}`,
    [tenantId],
  )
  const [campaigns] = await query<{ draft: number; sent: number }>(
    `SELECT SUM(status='draft') draft, SUM(status='sent') sent FROM crm_campaigns WHERE ${tw}`,
    [tenantId],
  )

  const recent = await query<ModuleRecentItem>(
    `SELECT id, name title, CONCAT(COALESCE(stage,''), ' · ', COALESCE(email,'')) subtitle, stage status,
      DATE_FORMAT(created_at,'%Y-%m-%d') date FROM crm_leads WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'customers', label: 'Customers', value: cust?.total ?? 0, description: `${cust?.active ?? 0} active`, href: '/dashboard/crm/customers' },
      { id: 'leads', label: 'Leads', value: leads?.total ?? 0, description: `${leads?.new ?? 0} new`, href: '/dashboard/crm/leads' },
      { id: 'campaigns', label: 'Campaigns sent', value: campaigns?.sent ?? 0, href: '/dashboard/crm/campaigns' },
      { id: 'draft', label: 'Draft campaigns', value: campaigns?.draft ?? 0 },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/crm/leads' })),
    alerts: (leads?.new ?? 0) > 10 ? [{ message: `${leads?.new} new leads need follow-up`, severity: 'info', href: '/dashboard/crm/leads' }] : [],
    quickLinks: [
      { label: 'Customers', href: '/dashboard/crm/customers' },
      { label: 'Segments', href: '/dashboard/crm/segments' },
      { label: 'Campaigns', href: '/dashboard/crm/campaigns' },
    ],
  }
}

async function accountingDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [gl] = await query<{ accounts: number; entries: number }>(
    `SELECT (SELECT COUNT(*) FROM gl_accounts WHERE ${tw}) accounts,
      (SELECT COUNT(*) FROM journal_entries WHERE ${tw} AND status='posted') entries`,
    [tenantId, tenantId],
  )
  const [ap] = await query<{ open: number; amount: number }>(
    `SELECT COUNT(*) open, COALESCE(SUM(total_amount),0) amount FROM ap_invoices WHERE ${tw} AND status IN ('draft','approved')`,
    [tenantId],
  )
  const [ar] = await query<{ open: number; amount: number }>(
    `SELECT COUNT(*) open, COALESCE(SUM(total_amount),0) amount FROM ar_invoices WHERE ${tw} AND status IN ('draft','sent','overdue')`,
    [tenantId],
  )
  const [expenses] = await query<{ total: number; amount: number }>(
    `SELECT COUNT(*) total, COALESCE(SUM(amount),0) amount FROM expenses WHERE ${tw}
     AND expense_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  )

  const trend = await query<{ m: string; d: number; c: number }>(
    `SELECT DATE_FORMAT(je.entry_date,'%Y-%m') m, COALESCE(SUM(jl.debit),0) d, COALESCE(SUM(jl.credit),0) c
     FROM journal_lines jl
     JOIN journal_entries je ON jl.entry_id = je.id
     WHERE je.tenant_id = ? AND je.status = 'posted'
     GROUP BY DATE_FORMAT(je.entry_date,'%Y-%m') ORDER BY m DESC LIMIT 6`,
    [tenantId],
  ).catch(() => [])

  return {
    kpis: [
      { id: 'accounts', label: 'GL accounts', value: gl?.accounts ?? 0, href: '/dashboard/accounting/ledger' },
      { id: 'entries', label: 'Posted journals', value: gl?.entries ?? 0 },
      { id: 'ap', label: 'AP outstanding', value: fmtKes(Number(ap?.amount ?? 0)), description: `${ap?.open ?? 0} invoices` },
      { id: 'ar', label: 'AR outstanding', value: fmtKes(Number(ar?.amount ?? 0)), description: `${ar?.open ?? 0} invoices` },
      { id: 'expenses', label: 'Expenses (30d)', value: fmtKes(Number(expenses?.amount ?? 0)) },
    ],
    trends: trend.length
      ? [{ id: 'gl', name: 'Journal activity', points: [...trend].reverse().map((t) => ({ label: t.m, value: Number(t.d) + Number(t.c) })) }]
      : [],
    recent: [],
    alerts: (ar?.open ?? 0) > 0 ? [{ message: `${ar?.open} open receivable(s)`, severity: 'info', href: '/dashboard/accounting/reports' }] : [],
    quickLinks: [
      { label: 'General ledger', href: '/dashboard/accounting/ledger' },
      { label: 'Financial reports', href: '/dashboard/accounting/reports' },
      { label: 'Wallet', href: '/dashboard/wallet' },
      { label: 'Payroll GL', href: '/dashboard/hr/payroll' },
    ],
  }
}

async function logisticsDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [del] = await query<{ total: number; pending: number; delivered: number }>(
    `SELECT COUNT(*) total,
      SUM(status IN ('pending','assigned','in_transit')) pending,
      SUM(status='delivered') delivered
     FROM deliveries WHERE ${tw} AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  )

  const recent = await query<ModuleRecentItem>(
    `SELECT id, CONCAT('Delivery ', LEFT(id,8)) title, status subtitle, status,
      DATE_FORMAT(created_at,'%Y-%m-%d') date FROM deliveries WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'total', label: 'Deliveries (30d)', value: del?.total ?? 0 },
      { id: 'pending', label: 'In progress', value: del?.pending ?? 0, severity: (del?.pending ?? 0) > 0 ? 'warning' : 'default', href: '/dashboard/logistics' },
      { id: 'done', label: 'Delivered', value: del?.delivered ?? 0, severity: 'success' },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/logistics' })),
    alerts: (del?.pending ?? 0) > 0 ? [{ message: `${del?.pending} delivery(s) in progress`, severity: 'info', href: '/dashboard/logistics' }] : [],
    quickLinks: [
      { label: 'Deliveries', href: '/dashboard/logistics' },
      { label: 'Routes', href: '/dashboard/logistics/routes' },
      { label: 'Driver app', href: '/dashboard/mobile/delivery' },
    ],
  }
}

async function hrDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [emp] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) total, SUM(status='active') active FROM hr_employees WHERE ${tw}`,
    [tenantId],
  )
  const [leave] = await query<{ pending: number }>(
    `SELECT COUNT(*) pending FROM hr_leave_requests WHERE ${tw} AND status='pending'`,
    [tenantId],
  )
  const [payroll] = await query<{ draft: number; paid: number }>(
    `SELECT SUM(status='draft') draft, SUM(status='paid') paid FROM hr_payroll_runs WHERE ${tw}`,
    [tenantId],
  )
  const [attendance] = await query<{ today: number }>(
    `SELECT COUNT(DISTINCT employee_id) today FROM hr_attendance WHERE ${tw} AND work_date = CURDATE()`,
    [tenantId],
  )

  const recent = await query<ModuleRecentItem>(
    `SELECT id, full_name title, CONCAT(department,' · ', job_title) subtitle, status,
      DATE_FORMAT(hire_date,'%Y-%m-%d') date FROM hr_employees WHERE ${tw} ORDER BY created_at DESC LIMIT 8`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'headcount', label: 'Employees', value: emp?.total ?? 0, description: `${emp?.active ?? 0} active` },
      { id: 'leave', label: 'Pending leave', value: leave?.pending ?? 0, severity: (leave?.pending ?? 0) > 0 ? 'warning' : 'default', href: '/dashboard/hr/leave' },
      { id: 'payroll', label: 'Payroll runs paid', value: payroll?.paid ?? 0, href: '/dashboard/hr/payroll' },
      { id: 'attendance', label: 'Present today', value: attendance?.today ?? 0 },
    ],
    trends: [],
    recent: recent.map((r) => ({ ...r, href: '/dashboard/hr' })),
    alerts: (leave?.pending ?? 0) > 0 ? [{ message: `${leave?.pending} leave request(s) awaiting approval`, severity: 'warning', href: '/dashboard/hr/leave' }] : [],
    quickLinks: [
      { label: 'Employees', href: '/dashboard/hr' },
      { label: 'Payroll', href: '/dashboard/hr/payroll' },
      { label: 'Attendance', href: '/dashboard/hr/attendance' },
    ],
  }
}

async function analyticsDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [reports] = await query<{ snapshots: number; deliveries: number; failed: number }>(
    `SELECT (SELECT COUNT(*) FROM report_snapshots WHERE ${tw}) snapshots,
      (SELECT COUNT(*) FROM report_deliveries WHERE ${tw}) deliveries,
      (SELECT COUNT(*) FROM report_deliveries WHERE ${tw} AND status='failed') failed`,
    [tenantId, tenantId, tenantId],
  )
  const [scheduled] = await query<{ active: number }>(
    `SELECT COUNT(*) active FROM scheduled_reports WHERE ${tw} AND active=1`,
    [tenantId],
  )

  return {
    kpis: [
      { id: 'snapshots', label: 'Report snapshots', value: reports?.snapshots ?? 0, href: '/dashboard/analytics/reports' },
      { id: 'deliveries', label: 'Report deliveries', value: reports?.deliveries ?? 0 },
      { id: 'failed', label: 'Failed deliveries', value: reports?.failed ?? 0, severity: (reports?.failed ?? 0) > 0 ? 'critical' : 'default' },
      { id: 'schedules', label: 'Active schedules', value: scheduled?.active ?? 0, href: '/dashboard/analytics/scheduled' },
    ],
    trends: [],
    recent: [],
    alerts: [],
    quickLinks: [
      { label: 'BI Analytics', href: '/dashboard/analytics' },
      { label: 'Reports hub', href: '/dashboard/analytics/reports' },
      { label: 'Communications', href: '/dashboard/communications' },
    ],
  }
}

async function notificationsDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [outbox] = await query<{ pending: number; sent: number; failed: number }>(
    `SELECT SUM(status='pending') pending, SUM(status='sent') sent, SUM(status='failed') failed
     FROM notification_outbox WHERE ${tw}`,
    [tenantId],
  )
  const [comm] = await query<{ sent: number }>(
    `SELECT COUNT(*) sent FROM communication_messages WHERE ${tw} AND status='sent'
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  ).catch(() => [{ sent: 0 }])

  return {
    kpis: [
      { id: 'pending', label: 'Outbox pending', value: outbox?.pending ?? 0, severity: (outbox?.pending ?? 0) > 20 ? 'warning' : 'default' },
      { id: 'sent', label: 'Sent', value: outbox?.sent ?? 0, severity: 'success' },
      { id: 'failed', label: 'Failed', value: outbox?.failed ?? 0, severity: (outbox?.failed ?? 0) > 0 ? 'critical' : 'default' },
      { id: 'comm', label: 'Messages sent (30d)', value: comm?.sent ?? 0, href: '/dashboard/communications' },
    ],
    trends: [],
    recent: [],
    alerts: (outbox?.failed ?? 0) > 0 ? [{ message: 'Process outbox to retry failed notifications', severity: 'warning', href: '/dashboard/notifications' }] : [],
    quickLinks: [{ label: 'Inbox', href: '/dashboard/notifications' }],
  }
}

async function integrationsDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [hooks] = await query<{ active: number }>(
    `SELECT COUNT(*) active FROM webhook_endpoints WHERE ${tw} AND status='active'`,
    [tenantId],
  )
  const [log] = await query<{ success: number; fail: number }>(
    `SELECT SUM(success=1) success, SUM(success=0) fail FROM webhook_delivery_log WHERE ${tw}
     AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [tenantId, PERIOD_DAYS],
  ).catch(() => [{ success: 0, fail: 0 }])
  const [devices] = await query<{ total: number; active: number }>(
    `SELECT COUNT(*) total, SUM(status='active') active FROM iot_devices WHERE ${tw}`,
    [tenantId],
  ).catch(() => [{ total: 0, active: 0 }])
  const [iotEvents] = await query<{ recent: number }>(
    `SELECT COUNT(*) recent FROM iot_sensor_events WHERE ${tw}
     AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
    [tenantId],
  ).catch(() => [{ recent: 0 }])

  return {
    kpis: [
      { id: 'devices', label: 'IoT devices', value: devices?.active ?? 0, description: `${devices?.total ?? 0} registered`, href: '/dashboard/integrations/devices' },
      { id: 'iot24h', label: 'Sensor events (24h)', value: iotEvents?.recent ?? 0, href: '/dashboard/integrations/iot' },
      { id: 'webhooks', label: 'Active webhooks', value: hooks?.active ?? 0, href: '/dashboard/integrations' },
      { id: 'fail', label: 'Webhook failures', value: log?.fail ?? 0, severity: (log?.fail ?? 0) > 0 ? 'warning' : 'default' },
    ],
    trends: [],
    recent: [],
    alerts: [],
    quickLinks: [
      { label: 'IoT hub', href: '/dashboard/integrations/iot' },
      { label: 'Device registry', href: '/dashboard/integrations/devices' },
      { label: 'Connections', href: '/dashboard/integrations' },
    ],
  }
}

async function aiDashboard(tenantId: string) {
  const tw = tenantWhere()
  const [forecasts] = await query<{ species: number }>(
    `SELECT COUNT(DISTINCT species_or_sku) species FROM demand_forecasts WHERE ${tw} AND forecast_date >= CURDATE()`,
    [tenantId],
  )
  const [sessions] = await query<{ chats: number }>(
    `SELECT COUNT(*) chats FROM ai_chat_sessions WHERE ${tw}`,
    [tenantId],
  ).catch(() => [{ chats: 0 }])
  const [briefs] = await query<{ total: number }>(
    `SELECT COUNT(*) total FROM ai_insights WHERE ${tw}
     AND insight_type = 'business_brief' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [tenantId],
  ).catch(() => [{ total: 0 }])

  return {
    kpis: [
      { id: 'forecast', label: 'SKUs forecasted', value: forecasts?.species ?? 0, href: '/dashboard/ai' },
      { id: 'briefs', label: 'AI briefs (7d)', value: briefs?.total ?? 0, href: '/dashboard/ai#brief' },
      { id: 'chats', label: 'AI chat sessions', value: sessions?.chats ?? 0, href: '/dashboard/ai#chat' },
    ],
    trends: [],
    recent: [],
    alerts: briefs?.total === 0 ? [{ message: 'Run AI automation for executive business brief', severity: 'info', href: '/dashboard/ai' }] : [],
    quickLinks: [
      { label: 'AI Command Center', href: '/dashboard/ai' },
      { label: 'Reports + AI narrative', href: '/dashboard/analytics/reports' },
    ],
  }
}

async function tenantDashboard(tenantId: string) {
  const [members] = await query<{ total: number }>(
    `SELECT COUNT(*) total FROM tenant_members WHERE tenant_id = ? AND status='active'`,
    [tenantId],
  )
  const branches = { total: 1 }

  return {
    kpis: [
      { id: 'members', label: 'Team members', value: members?.total ?? 0, href: '/dashboard/team' },
      { id: 'branches', label: 'Branches', value: branches?.total ?? 1, href: '/dashboard/organization' },
    ],
    trends: [],
    recent: [],
    alerts: [],
    quickLinks: [
      { label: 'Organization', href: '/dashboard/organization' },
      { label: 'Team', href: '/dashboard/team' },
      { label: 'Settings', href: '/dashboard/settings' },
      { label: 'Audit', href: '/dashboard/admin/audit' },
    ],
  }
}

type ModuleDashboardBody = Omit<
  ModuleDashboardPayload,
  'moduleId' | 'title' | 'description' | 'standards' | 'periodLabel' | 'refreshedAt'
>

const HANDLERS: Record<string, (tenantId: string) => Promise<ModuleDashboardBody>> = {
  fishing: fishingDashboard,
  commerce: commerceDashboard,
  inventory: inventoryDashboard,
  coldchain: coldchainDashboard,
  procurement: procurementDashboard,
  crm: crmDashboard,
  accounting: accountingDashboard,
  logistics: logisticsDashboard,
  hr: hrDashboard,
  analytics: analyticsDashboard,
  notifications: notificationsDashboard,
  integrations: integrationsDashboard,
  ai: aiDashboard,
  tenant: tenantDashboard,
}

export async function getModuleDashboard(
  moduleId: string,
  tenantId: string,
): Promise<ModuleDashboardPayload | null> {
  const handler = HANDLERS[moduleId]
  if (!handler) return null

  const standardsMap: Record<string, string[]> = {
    fishing: ['FAO area codes', 'EU 1224/2009 traceability', 'ISO 8601'],
    commerce: ['PCI SAQ-A metadata', 'ISO 4217 KES', 'GS1 product IDs'],
    inventory: ['Batch/lot tracking', 'FEFO expiry', 'HACCP storage types'],
    coldchain: ['HACCP Codex', 'FSMA cold chain', 'ISO 22000'],
    procurement: ['ISO 9001 supplier trace', '3-way match AP'],
    crm: ['GDPR contact data', 'RFM segmentation'],
    accounting: ['IFRS / IAS 1', 'Double-entry GAAP-ready', 'ISO 4217'],
    logistics: ['Proof of delivery', 'ISO 8601 scheduling'],
    hr: ['Labour compliance', 'PAYE/NHIF payroll'],
    analytics: ['IFRS reports', 'ISO 8601 periods', 'UTF-8 CSV exports'],
  }

  const data = await handler(tenantId)
  const meta = baseMeta(moduleId)
  return {
    ...meta,
    ...data,
    standards: standardsMap[moduleId] ?? meta.standards,
  }
}

export { MODULE_DASHBOARD_IDS } from './constants'

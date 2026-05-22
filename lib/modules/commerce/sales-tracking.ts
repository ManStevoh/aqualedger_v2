import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { resolveTenantId } from '@/lib/tenant'
import { getSalesContractSummary } from '@/lib/modules/commerce/sales-contracts'

export interface SalesTrackingSummary {
  grossSales: number
  deliveredSales: number
  paidSales: number
  unpaidSales: number
  orderCount: number
  deliveredCount: number
  avgOrderValue: number
  contractOpenValue: number
  contractActiveCount: number
}

export interface SalesTrackingReport {
  periodDays: number
  summary: SalesTrackingSummary
  monthlyTrend: { month: string; sales: number; orders: number }[]
  byStatus: { status: string; count: number; amount: number }[]
  byPaymentStatus: { paymentStatus: string; count: number; amount: number }[]
  topCustomers: { name: string; orders: number; amount: number }[]
  topProducts: { name: string; quantityKg: number; amount: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    buyerName: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
  }[]
}

function periodClause(days: number): { sql: string; params: unknown[] } {
  const safe = Math.min(Math.max(days, 1), 3650)
  return {
    sql: 'o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
    params: [safe],
  }
}

export async function getSalesTracking(
  tenantId: string,
  options?: { periodDays?: number; sellerUserId?: string | null },
): Promise<SalesTrackingReport> {
  const tid = resolveTenantId(tenantId)
  const periodDays = options?.periodDays ?? 30
  const period = periodClause(periodDays)

  const baseConditions = [tenantWhere('o'), period.sql, "o.status != 'cancelled'"]
  const baseParams: unknown[] = [tid, ...period.params]

  if (options?.sellerUserId) {
    baseConditions.push('o.seller_id = ?')
    baseParams.push(options.sellerUserId)
  }

  const where = `WHERE ${baseConditions.join(' AND ')}`

  const [summaryRow] = await query<{
    gross_sales: number
    delivered_sales: number
    paid_sales: number
    unpaid_sales: number
    order_count: number
    delivered_count: number
  }>(
    `SELECT
       COALESCE(SUM(o.total), 0) as gross_sales,
       COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END), 0) as delivered_sales,
       COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total ELSE 0 END), 0) as paid_sales,
       COALESCE(SUM(CASE WHEN o.payment_status != 'paid' THEN o.total ELSE 0 END), 0) as unpaid_sales,
       COUNT(*) as order_count,
       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as delivered_count
     FROM orders o
     ${where}`,
    baseParams,
  )

  const contractSummary = await getSalesContractSummary(tid)

  const grossSales = Number(summaryRow?.gross_sales ?? 0)
  const orderCount = Number(summaryRow?.order_count ?? 0)

  const monthlyTrend = await query<{ month: string; sales: number; orders: number }>(
    `SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month,
       COALESCE(SUM(o.total), 0) as sales,
       COUNT(*) as orders
     FROM orders o
     ${where}
     GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
     ORDER BY month`,
    baseParams,
  )

  const byStatus = await query<{ status: string; count: number; amount: number }>(
    `SELECT o.status, COUNT(*) as count, COALESCE(SUM(o.total), 0) as amount
     FROM orders o
     ${where}
     GROUP BY o.status
     ORDER BY amount DESC`,
    baseParams,
  )

  const byPaymentStatus = await query<{ payment_status: string; count: number; amount: number }>(
    `SELECT o.payment_status, COUNT(*) as count, COALESCE(SUM(o.total), 0) as amount
     FROM orders o
     ${where}
     GROUP BY o.payment_status
     ORDER BY amount DESC`,
    baseParams,
  )

  const topCustomers = await query<{ name: string; orders: number; amount: number }>(
    `SELECT COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Guest') as name,
       COUNT(*) as orders,
       COALESCE(SUM(o.total), 0) as amount
     FROM orders o
     LEFT JOIN users u ON o.buyer_id = u.id
     ${where}
     GROUP BY o.buyer_id, u.first_name, u.last_name
     ORDER BY amount DESC
     LIMIT 8`,
    baseParams,
  )

  const topProducts = await query<{ name: string; quantity_kg: number; amount: number }>(
    `SELECT COALESCE(fs.name, 'Other') as name,
       COALESCE(SUM(oi.quantity_kg), 0) as quantity_kg,
       COALESCE(SUM(oi.quantity_kg * oi.unit_price), 0) as amount
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN fish_species fs ON oi.species_id = fs.id
     ${where}
     GROUP BY fs.id, fs.name
     ORDER BY amount DESC
     LIMIT 8`,
    baseParams,
  )

  const recentOrders = await query<{
    id: string
    order_number: string
    buyer_name: string | null
    total: number
    status: string
    payment_status: string
    created_at: string
  }>(
    `SELECT o.id, o.order_number,
       CONCAT(u.first_name, ' ', u.last_name) as buyer_name,
       o.total, o.status, o.payment_status, o.created_at
     FROM orders o
     LEFT JOIN users u ON o.buyer_id = u.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT 15`,
    baseParams,
  )

  return {
    periodDays,
    summary: {
      grossSales,
      deliveredSales: Number(summaryRow?.delivered_sales ?? 0),
      paidSales: Number(summaryRow?.paid_sales ?? 0),
      unpaidSales: Number(summaryRow?.unpaid_sales ?? 0),
      orderCount,
      deliveredCount: Number(summaryRow?.delivered_count ?? 0),
      avgOrderValue: orderCount > 0 ? grossSales / orderCount : 0,
      contractOpenValue: contractSummary.openValueKes,
      contractActiveCount: contractSummary.active,
    },
    monthlyTrend: monthlyTrend.map((r) => ({
      month: r.month,
      sales: Number(r.sales) || 0,
      orders: Number(r.orders) || 0,
    })),
    byStatus: byStatus.map((r) => ({
      status: r.status,
      count: Number(r.count) || 0,
      amount: Number(r.amount) || 0,
    })),
    byPaymentStatus: byPaymentStatus.map((r) => ({
      paymentStatus: r.payment_status,
      count: Number(r.count) || 0,
      amount: Number(r.amount) || 0,
    })),
    topCustomers: topCustomers.map((r) => ({
      name: r.name?.trim() || 'Guest',
      orders: Number(r.orders) || 0,
      amount: Number(r.amount) || 0,
    })),
    topProducts: topProducts.map((r) => ({
      name: r.name,
      quantityKg: Number(r.quantity_kg) || 0,
      amount: Number(r.amount) || 0,
    })),
    recentOrders: recentOrders.map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      buyerName: r.buyer_name?.trim() || 'Guest',
      total: Number(r.total) || 0,
      status: r.status,
      paymentStatus: r.payment_status,
      createdAt: String(r.created_at),
    })),
  }
}

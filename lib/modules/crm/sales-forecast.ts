import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface SalesForecastMonth {
  month: string
  pipelineValue: number
  weightedPipeline: number
  closedRevenue: number
  forecastRevenue: number
}

export async function getSalesForecast(tenantId: string, months = 6): Promise<{
  months: SalesForecastMonth[]
  winRate: number
  avgDealSize: number
}> {
  const leads = await query<{ status: string; estimated_value: number }>(
    `SELECT status, COALESCE(estimated_value, 0) as estimated_value FROM crm_leads
     WHERE ${tenantWhere()} AND status NOT IN ('lost', 'converted')`,
    [tenantId],
  )

  const closed = await query<{ month: string; revenue: number }>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue
     FROM orders WHERE ${tenantWhere()} AND status IN ('confirmed', 'delivered', 'completed')
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month`,
    [tenantId, months],
  )

  const pipelineValue = leads.reduce((s, l) => s + Number(l.estimated_value), 0)
  const winRate = 0.35
  const weightedPipeline = pipelineValue * winRate

  const avgDeal =
    closed.length > 0
      ? closed.reduce((s, c) => s + Number(c.revenue), 0) / closed.length
      : weightedPipeline / Math.max(leads.length, 1)

  const monthKeys: string[] = []
  const now = new Date()
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const closedMap = new Map(closed.map((c) => [c.month, Number(c.revenue)]))
  const avgMonthly = closed.length
    ? closed.reduce((s, c) => s + Number(c.revenue), 0) / closed.length
    : avgDeal

  const result: SalesForecastMonth[] = monthKeys.map((month, i) => {
    const closedRevenue = closedMap.get(month) ?? 0
    const growth = 1 + i * 0.03
    const forecastRevenue = Math.round(
      (i === 0 ? weightedPipeline * 0.4 : avgMonthly * growth) + closedRevenue * 0.1,
    )
    return {
      month,
      pipelineValue: i === 0 ? pipelineValue : 0,
      weightedPipeline: i === 0 ? weightedPipeline : 0,
      closedRevenue,
      forecastRevenue,
    }
  })

  return { months: result, winRate, avgDealSize: Math.round(avgDeal) }
}

import { query } from '@/lib/db'

export interface PricePrediction {
  species: string
  current_avg_price: number
  predicted_price: number
  trend_pct: number
  data_points: number
  model: 'linear_v1'
}

interface CatchPriceRow {
  species: string
  day: string
  avg_price: number
}

function linearRegression(points: { x: number; y: number }[]): {
  slope: number
  intercept: number
} {
  const n = points.length
  if (n === 0) return { slope: 0, intercept: 0 }
  if (n === 1) return { slope: 0, intercept: points[0].y }

  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumX2 - sumX * sumX

  if (denom === 0) return { slope: 0, intercept: sumY / n }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export async function computePricePredictions(tenantId: string): Promise<PricePrediction[]> {
  const rows = await query<CatchPriceRow>(
    `SELECT COALESCE(fs.name, 'Unknown') as species,
            DATE(c.created_at) as day,
            AVG(c.unit_price) as avg_price
     FROM catches c
     INNER JOIN fishing_trips ft ON c.trip_id = ft.id
     LEFT JOIN fish_species fs ON c.species_id = fs.id
     WHERE ft.tenant_id = ?
       AND c.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       AND c.unit_price > 0
     GROUP BY fs.name, DATE(c.created_at)
     ORDER BY species ASC, day ASC`,
    [tenantId],
  )

  const bySpecies = new Map<string, CatchPriceRow[]>()
  for (const row of rows) {
    const species = row.species || 'Unknown'
    if (!bySpecies.has(species)) bySpecies.set(species, [])
    bySpecies.get(species)!.push(row)
  }

  const predictions: PricePrediction[] = []

  for (const [species, dayRows] of bySpecies) {
    const sorted = [...dayRows].sort((a, b) => String(a.day).localeCompare(String(b.day)))
    const baseDate = new Date(String(sorted[0].day)).getTime()
    const points = sorted.map((r) => ({
      x: (new Date(String(r.day)).getTime() - baseDate) / 86400000,
      y: Number(r.avg_price),
    }))

    const { slope, intercept } = linearRegression(points)
    const nextX = points.length > 0 ? points[points.length - 1].x + 1 : 0
    const predicted = Math.max(0, Math.round((slope * nextX + intercept) * 100) / 100)
    const current = points.length > 0 ? points[points.length - 1].y : 0
    const trendPct =
      current > 0 ? Math.round(((predicted - current) / current) * 1000) / 10 : 0

    predictions.push({
      species,
      current_avg_price: Math.round(current * 100) / 100,
      predicted_price: predicted,
      trend_pct: trendPct,
      data_points: points.length,
      model: 'linear_v1',
    })
  }

  return predictions.sort((a, b) => b.data_points - a.data_points)
}

import { query, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface DemandForecast {
  id: string
  tenant_id: string
  species_or_sku: string
  forecast_date: string
  predicted_kg: number
  confidence_pct: number
  model_version: string
  created_at: string
}

interface DailyDemand {
  species: string
  day: string
  total_kg: number
}

function movingAverage(values: number[], window = 7): number {
  if (values.length === 0) return 0
  const slice = values.slice(-window)
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function computeDemandForecasts(tenantId: string): Promise<DemandForecast[]> {
  const catchRows = await query<DailyDemand>(
    `SELECT COALESCE(fs.name, 'Unknown') as species,
            DATE(c.created_at) as day,
            COALESCE(SUM(c.quantity_kg), 0) as total_kg
     FROM catches c
     LEFT JOIN fish_species fs ON c.species_id = fs.id
     WHERE ${tenantWhere('c')} AND c.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
     GROUP BY fs.name, DATE(c.created_at)`,
    [tenantId],
  )

  const listingRows = await query<DailyDemand>(
    `SELECT COALESCE(fl.fish_type, fs.name, 'Unknown') as species,
            DATE(fl.updated_at) as day,
            COALESCE(SUM(fl.quantity_kg - fl.available_quantity_kg), 0) as total_kg
     FROM fish_listings fl
     LEFT JOIN fish_species fs ON fl.species_id = fs.id
     WHERE ${tenantWhere('fl')}
       AND fl.status IN ('sold_out', 'delisted')
       AND fl.updated_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
     GROUP BY COALESCE(fl.fish_type, fs.name), DATE(fl.updated_at)`,
    [tenantId],
  )

  const bySpecies = new Map<string, Map<string, number>>()

  for (const row of [...catchRows, ...listingRows]) {
    const species = row.species || 'Unknown'
    if (!bySpecies.has(species)) bySpecies.set(species, new Map())
    const dayMap = bySpecies.get(species)!
    dayMap.set(String(row.day), (dayMap.get(String(row.day)) ?? 0) + Number(row.total_kg))
  }

  const today = new Date().toISOString().split('T')[0]
  const forecasts: DemandForecast[] = []

  await execute(
    `DELETE FROM demand_forecasts WHERE ${tenantWhere()} AND forecast_date >= CURDATE()`,
    [tenantId],
  )

  for (const [species, dayMap] of bySpecies) {
    const sortedDays = [...dayMap.keys()].sort()
    const dailyValues = sortedDays.map((d) => dayMap.get(d) ?? 0)
    const avg = movingAverage(dailyValues, 7)
    const confidence = Math.min(95, 50 + dailyValues.length * 3)

    for (let i = 1; i <= 7; i++) {
      const forecastDate = addDays(today, i)
      const id = generateId()
      await execute(
        `INSERT INTO demand_forecasts
         (id, tenant_id, species_or_sku, forecast_date, predicted_kg, confidence_pct, model_version)
         VALUES (?, ?, ?, ?, ?, ?, 'moving_avg_v1')`,
        [id, tenantId, species, forecastDate, Math.round(avg * 1000) / 1000, confidence],
      )
      forecasts.push({
        id,
        tenant_id: tenantId,
        species_or_sku: species,
        forecast_date: forecastDate,
        predicted_kg: Math.round(avg * 1000) / 1000,
        confidence_pct: confidence,
        model_version: 'moving_avg_v1',
        created_at: new Date().toISOString(),
      })
    }
  }

  return forecasts
}

export async function listDemandForecasts(
  tenantId: string,
  days = 14,
): Promise<DemandForecast[]> {
  return query<DemandForecast>(
    `SELECT * FROM demand_forecasts
     WHERE ${tenantWhere()}
       AND forecast_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY species_or_sku ASC, forecast_date ASC`,
    [tenantId, days],
  )
}

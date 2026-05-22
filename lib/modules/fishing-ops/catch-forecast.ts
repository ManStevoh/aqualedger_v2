import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface CatchForecastRow {
  zoneId: string
  zoneName: string
  speciesName: string
  avgKgPerTrip: number
  forecastKgNext30: number
  trend: 'up' | 'stable' | 'down'
}

export async function getCatchForecast(tenantId: string, days = 30): Promise<CatchForecastRow[]> {
  const history = await query<{
    zone_id: string | null
    zone_name: string
    species_name: string
    total_kg: number
    trip_count: number
  }>(
    `SELECT fz.id as zone_id, COALESCE(fz.name, 'Open') as zone_name,
            fs.name as species_name,
            SUM(c.quantity_kg) as total_kg,
            COUNT(DISTINCT t.id) as trip_count
     FROM catches c
     JOIN fishing_trips t ON c.trip_id = t.id
     LEFT JOIN fishing_zones fz ON t.zone_id = fz.id
     JOIN fish_species fs ON c.species_id = fs.id
     WHERE t.tenant_id = ?
       AND c.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
     GROUP BY fz.id, fz.name, fs.name`,
    [tenantId],
  )

  return history.map((h) => {
    const trips = Math.max(Number(h.trip_count), 1)
    const avgKg = Number(h.total_kg) / trips
    const dailyRate = avgKg / 3
    const forecastKg = Math.round(dailyRate * days)
    const trend: CatchForecastRow['trend'] =
      forecastKg > avgKg * 8 ? 'up' : forecastKg < avgKg * 4 ? 'down' : 'stable'
    return {
      zoneId: h.zone_id || 'open',
      zoneName: h.zone_name,
      speciesName: h.species_name,
      avgKgPerTrip: Math.round(avgKg * 10) / 10,
      forecastKgNext30: forecastKg,
      trend,
    }
  })
}

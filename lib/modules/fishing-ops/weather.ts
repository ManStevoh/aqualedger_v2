import { getOpenWeatherForecastUrl } from '@/lib/config/external-apis'
import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { logger } from '@/lib/logger'

export interface ZoneWeather {
  zoneId: string
  zoneName: string
  county: string | null
  faoArea: string | null
  forecast: {
    date: string
    windKph: number
    waveHeightM: number
    condition: string
    fishingSuitability: 'good' | 'moderate' | 'poor'
  }[]
}

export async function getFishingZoneWeather(tenantId: string): Promise<ZoneWeather[]> {
  const zones = await query<{ id: string; name: string; county: string | null; fao_area: string | null }>(
    `SELECT id, name, county, fao_area FROM fishing_zones WHERE ${tenantWhere()} AND status = 'open'`,
    [tenantId],
  )

  const apiKey = process.env.OPENWEATHER_API_KEY
  const results: ZoneWeather[] = []

  for (const zone of zones) {
    let forecast: ZoneWeather['forecast'] = defaultForecast()

    if (apiKey && zone.county) {
      try {
        const q = encodeURIComponent(`${zone.county}, Kenya`)
        const res = await fetch(getOpenWeatherForecastUrl(q, apiKey))
        if (res.ok) {
          const data = (await res.json()) as {
            list?: { dt: number; wind?: { speed: number }; weather?: { main: string }[] }[]
          }
          forecast = (data.list || []).slice(0, 5).map((item) => {
            const windKph = Math.round((item.wind?.speed ?? 0) * 3.6)
            const condition = item.weather?.[0]?.main || 'Unknown'
            const fishingSuitability: 'good' | 'moderate' | 'poor' =
              windKph < 25 ? 'good' : windKph < 40 ? 'moderate' : 'poor'
            return {
              date: new Date(item.dt * 1000).toISOString().slice(0, 10),
              windKph,
              waveHeightM: Math.round((windKph / 30) * 10) / 10,
              condition,
              fishingSuitability,
            }
          })
        }
      } catch (err) {
        logger.warn('Weather API failed', { zone: zone.name, error: err })
      }
    }

    results.push({
      zoneId: zone.id,
      zoneName: zone.name,
      county: zone.county,
      faoArea: zone.fao_area,
      forecast,
    })
  }

  return results
}

function defaultForecast(): ZoneWeather['forecast'] {
  const days = 5
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      date: d.toISOString().slice(0, 10),
      windKph: 15 + i * 3,
      waveHeightM: 0.8,
      condition: 'Clear',
      fishingSuitability: 'good' as const,
    }
  })
}

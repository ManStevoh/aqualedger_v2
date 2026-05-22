import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getFishingZoneWeather } from '@/lib/modules/fishing-ops/weather'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('fishing.zones.read')
  const zones = await getFishingZoneWeather(ctx.tenantId)
  return jsonOk({ zones })
}, 'v2/fishing-ops/weather')

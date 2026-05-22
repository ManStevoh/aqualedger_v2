import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getPlatformHealth, healthToServiceRows } from '@/lib/modules/platform/health-check'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const health = await getPlatformHealth()
  const services = healthToServiceRows(health)
  return jsonOk({
    health,
    services,
    checkedAt: new Date().toISOString(),
  })
}, 'v2/platform/health')

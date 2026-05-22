import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getPlatformHealth } from '@/lib/modules/platform/health-check'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const health = await getPlatformHealth()
  return jsonOk({ health })
}, 'v2/platform/health')

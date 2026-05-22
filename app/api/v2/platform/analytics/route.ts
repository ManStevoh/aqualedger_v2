import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getPlatformAnalytics } from '@/lib/modules/platform/analytics'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const analytics = await getPlatformAnalytics()
  return jsonOk({ analytics })
}, 'v2/platform/analytics')

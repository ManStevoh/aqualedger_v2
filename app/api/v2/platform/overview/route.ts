import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getPlatformOverview } from '@/lib/modules/platform/overview'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const overview = await getPlatformOverview()
  return jsonOk({ overview })
}, 'v2/platform/overview')

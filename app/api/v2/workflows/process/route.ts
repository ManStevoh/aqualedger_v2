import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { processPendingEvents } from '@/lib/events/workflow'

export const POST = apiHandler(async () => {
  await requirePermission('workflows.process')
  const processed = await processPendingEvents(50)
  return jsonOk({ processed })
}, 'v2/workflows/process')

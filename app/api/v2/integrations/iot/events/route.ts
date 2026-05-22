import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listIotSensorEvents } from '@/lib/modules/integrations/iot'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const processedParam = searchParams.get('processed')
  const processed =
    processedParam === 'true' ? true : processedParam === 'false' ? false : undefined

  const result = await listIotSensorEvents(ctx.tenantId, { page, limit, processed })
  return jsonOk(result)
}, 'v2/integrations/iot/events')

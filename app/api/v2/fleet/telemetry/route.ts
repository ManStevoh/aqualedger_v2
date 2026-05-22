import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getLatestBoatPositions, listGpsTelemetry } from '@/lib/modules/integrations/gps'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.boats.read')
  const { searchParams } = new URL(request.url)
  const boatId = searchParams.get('boatId')
  const latest = searchParams.get('latest') === '1'

  if (latest) {
    const positions = await getLatestBoatPositions(ctx.tenantId)
    return jsonOk({ positions })
  }

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const result = await listGpsTelemetry(ctx.tenantId, {
    boatId: boatId || undefined,
    page,
    limit,
  })
  return jsonOk(result)
}, 'v2/fleet/telemetry')

import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listScaleReadings } from '@/lib/modules/integrations/scale'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const result = await listScaleReadings(ctx.tenantId, { page, limit })
  return jsonOk(result)
}, 'v2/integrations/scale')

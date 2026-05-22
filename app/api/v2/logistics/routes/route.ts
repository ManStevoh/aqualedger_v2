import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getDeliveriesGroupedByCounty, type DeliveryStatus } from '@/lib/modules/logistics/service'

const querySchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('logistics.routes.read')
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.parse({
    status: searchParams.get('status') ?? undefined,
  })

  const result = await getDeliveriesGroupedByCounty(
    ctx.tenantId,
    parsed.status as DeliveryStatus | undefined,
  )

  return jsonOk(result)
}, 'v2/logistics/routes')

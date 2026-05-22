import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  traceabilityLotCreateSchema,
  traceabilityLotListQuerySchema,
} from '@/lib/modules/inventory/schemas'
import {
  listTraceabilityLots,
  createTraceabilityLot,
} from '@/lib/modules/inventory/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.traceability.read')
  const { searchParams } = new URL(request.url)
  const query = traceabilityLotListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    lotCode: searchParams.get('lotCode') ?? undefined,
  })

  const data = await listTraceabilityLots(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/traceability/lots')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.traceability.write')
  const body = traceabilityLotCreateSchema.parse(await request.json())
  const lot = await createTraceabilityLot(ctx.tenantId, body)
  return jsonOk({ lot }, 201)
}, 'v2/traceability/lots')

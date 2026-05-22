import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  boatFuelLogCreateSchema,
  boatFuelLogListQuerySchema,
} from '@/lib/modules/fishing-ops/schemas'
import {
  listBoatFuelLogs,
  createBoatFuelLog,
} from '@/lib/modules/fishing-ops/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.fuel.read')
  const { searchParams } = new URL(request.url)
  const query = boatFuelLogListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    boatId: searchParams.get('boatId') ?? undefined,
    tripId: searchParams.get('tripId') ?? undefined,
  })

  const data = await listBoatFuelLogs(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/fishing-ops/fuel')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.fuel.write')
  const body = boatFuelLogCreateSchema.parse(await request.json())
  const log = await createBoatFuelLog(ctx.tenantId, body)
  return jsonOk({ log }, 201)
}, 'v2/fishing-ops/fuel')

import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  fishingZoneCreateSchema,
  fishingZoneListQuerySchema,
  fishingZoneUpdateSchema,
} from '@/lib/modules/fishing-ops/schemas'
import {
  listFishingZones,
  createFishingZone,
  updateFishingZone,
  deleteFishingZone,
} from '@/lib/modules/fishing-ops/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.zones.read')
  const { searchParams } = new URL(request.url)
  const query = fishingZoneListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    code: searchParams.get('code') ?? undefined,
  })

  const data = await listFishingZones(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/fishing-ops/zones')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.zones.write')
  const body = await request.json()
  if (body.id) {
    const parsed = fishingZoneUpdateSchema.parse(body)
    const zone = await updateFishingZone(ctx.tenantId, parsed)
    return jsonOk({ zone })
  }
  const parsed = fishingZoneCreateSchema.parse(body)
  const zone = await createFishingZone(ctx.tenantId, parsed)
  return jsonOk({ zone }, 201)
}, 'v2/fishing-ops/zones')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.zones.write')
  const id = new URL(request.url).searchParams.get('id')
  if (!id) throw new Error('Zone ID is required')
  await deleteFishingZone(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/fishing-ops/zones')

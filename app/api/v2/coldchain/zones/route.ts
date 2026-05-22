import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listStorageZones, createStorageZone } from '@/lib/modules/coldchain/service'

const listQuerySchema = z.object({
  facilityId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createZoneSchema = z.object({
  facilityId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  targetTempC: z.coerce.number(),
  minTempC: z.coerce.number().optional(),
  maxTempC: z.coerce.number().optional(),
  capacityKg: z.coerce.number().optional(),
  status: z.enum(['active', 'maintenance', 'offline']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.zones.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    facilityId: searchParams.get('facilityId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { zones, total } = await listStorageZones(
    ctx.tenantId,
    parsed.facilityId,
    parsed.page,
    parsed.limit,
  )

  return jsonOk({
    zones,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/coldchain/zones')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.zones.write')
  const body = await request.json()
  const input = createZoneSchema.parse(body)
  const zone = await createStorageZone(ctx.tenantId, input)
  return jsonOk({ zone }, 201)
}, 'v2/coldchain/zones')

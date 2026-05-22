import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listTemperatureReadings,
  recordTemperatureReading,
} from '@/lib/modules/coldchain/service'

const listQuerySchema = z.object({
  zoneId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const recordReadingSchema = z.object({
  zoneId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
  readingC: z.coerce.number(),
  humidityPct: z.coerce.number().optional(),
  source: z.enum(['manual', 'iot', 'import']).optional(),
  recordedAt: z.string().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.readings.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    zoneId: searchParams.get('zoneId') ?? undefined,
    facilityId: searchParams.get('facilityId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { readings, total } = await listTemperatureReadings(ctx.tenantId, parsed)

  return jsonOk({
    readings,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/coldchain/readings')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.readings.write')
  const body = await request.json()
  const input = recordReadingSchema.parse(body)
  const reading = await recordTemperatureReading(ctx.tenantId, input)
  return jsonOk({ reading }, 201)
}, 'v2/coldchain/readings')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createQualityInspection, listQualityInspections } from '@/lib/modules/fishing-ops/quality-inspection'

const createSchema = z.object({
  catchId: z.string().uuid().optional().nullable(),
  tripId: z.string().uuid().optional().nullable(),
  landingSiteId: z.string().uuid().optional().nullable(),
  gradeAssigned: z.enum(['A', 'B', 'C', 'reject']),
  freshnessScore: z.number().int().min(1).max(10).optional(),
  parasiteCheck: z.boolean().optional(),
  temperatureC: z.number().optional(),
  notes: z.string().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.catches.read')
  const tripId = new URL(request.url).searchParams.get('tripId') || undefined
  const rows = await listQualityInspections(ctx.tenantId, tripId)
  return jsonOk({ inspections: rows })
}, 'v2/fishing-ops/quality')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.catches.write')
  const body = createSchema.parse(await request.json())
  const row = await createQualityInspection(ctx.tenantId, ctx.userId, body)
  return jsonOk({ inspection: row }, 201)
}, 'v2/fishing-ops/quality')

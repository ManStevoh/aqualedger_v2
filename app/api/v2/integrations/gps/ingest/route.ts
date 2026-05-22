import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { resolveIngestContext } from '@/lib/modules/integrations/ingest-auth'
import { ingestGpsTelemetry } from '@/lib/modules/integrations/gps'

const schema = z.object({
  boatId: z.string().uuid().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  speedKnots: z.coerce.number().min(0).optional(),
  headingDeg: z.coerce.number().min(0).max(360).optional(),
  accuracyM: z.coerce.number().min(0).optional(),
  recordedAt: z.string().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await resolveIngestContext(request)
  const body = await request.json()
  const payload = schema.parse(body)
  const result = await ingestGpsTelemetry(ctx, payload)
  return jsonOk(result, 201)
}, 'v2/integrations/gps/ingest')

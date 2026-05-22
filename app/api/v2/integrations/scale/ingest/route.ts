import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { resolveIngestContext } from '@/lib/modules/integrations/ingest-auth'
import { ingestScaleReading } from '@/lib/modules/integrations/scale'

const schema = z.object({
  weightKg: z.coerce.number().positive(),
  unit: z.enum(['kg', 'lb']).optional(),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
  locationLabel: z.string().max(120).optional(),
  recordedAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await resolveIngestContext(request)
  const body = await request.json()
  const payload = schema.parse(body)
  const result = await ingestScaleReading(ctx, payload)
  return jsonOk(result, 201)
}, 'v2/integrations/scale/ingest')

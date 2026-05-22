import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { resolveIngestContext } from '@/lib/modules/integrations/ingest-auth'
import { ingestIotWebhook } from '@/lib/modules/integrations/iot'

const ingestSchema = z.object({
  sensorId: z.string().max(100).optional(),
  facilityId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  eventType: z.string().max(50).default('temperature_reading'),
  temperatureC: z.coerce.number().optional(),
  humidityPct: z.coerce.number().min(0).max(100).optional(),
  doorOpen: z.coerce.boolean().optional(),
  powerOk: z.coerce.boolean().optional(),
  recordedAt: z.string().optional(),
  raw: z.record(z.unknown()).optional(),
})

/** Public device ingest — no JWT; use X-AquaERP-Device-Key or global ingest secret */
export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await resolveIngestContext(request)
  const body = await request.json()
  const payload = ingestSchema.parse(body)
  const result = await ingestIotWebhook(ctx, payload)
  return jsonOk(result, 201)
}, 'v2/integrations/iot/ingest')

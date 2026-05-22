import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { ingestIotWebhook } from '@/lib/modules/integrations/iot'

const ingestSchema = z.object({
  sensorId: z.string().max(100).optional(),
  facilityId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  eventType: z.string().max(50).default('temperature_reading'),
  temperatureC: z.coerce.number().optional(),
  humidityPct: z.coerce.number().min(0).max(100).optional(),
  recordedAt: z.string().optional(),
  raw: z.record(z.unknown()).optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.iot.write')
  const body = await request.json()
  const payload = ingestSchema.parse(body)
  const result = await ingestIotWebhook(
    { tenantId: ctx.tenantId, source: 'jwt' },
    payload,
  )
  return jsonOk(result, 201)
}, 'v2/integrations/iot/webhook')

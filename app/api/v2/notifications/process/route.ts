import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { processPendingOutbox } from '@/lib/notifications/outbox-processor'
import { processPendingEvents } from '@/lib/events/workflow'
import { runDueScheduledReports } from '@/lib/modules/analytics/scheduled-runner'

const bodySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.send')
  const raw = await request.json().catch(() => ({}))
  const { limit } = bodySchema.parse(raw)

  const outbox = await processPendingOutbox(limit, ctx.tenantId)
  const domainEventsProcessed = await processPendingEvents(limit)
  let scheduledReports = { processed: 0, results: [] as { reportId: string; ok: boolean }[] }
  try {
    scheduledReports = await runDueScheduledReports(ctx.tenantId)
  } catch {
    /* migration may be pending */
  }

  return jsonOk({ outbox, domainEventsProcessed, scheduledReports })
}, 'v2/notifications/process')

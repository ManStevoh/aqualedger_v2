import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listPendingOutbox } from '@/lib/notifications/outbox-processor'
import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.send')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    limit: searchParams.get('limit') ?? undefined,
  })

  const items = await listPendingOutbox(ctx.tenantId, parsed.limit)
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM notification_outbox
     WHERE ${tenantWhere()} AND status = 'pending' AND scheduled_at <= NOW()`,
    [ctx.tenantId],
  )

  return jsonOk({ items, count: countRow?.total ?? 0 })
}, 'v2/notifications/outbox')

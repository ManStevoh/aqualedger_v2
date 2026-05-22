import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  enqueueOfflineAction,
  processOfflineQueue,
  listPendingOffline,
} from '@/lib/modules/offline/sync-queue'

const enqueueSchema = z.object({
  deviceId: z.string().min(1).max(100),
  actionType: z.string().min(1).max(80),
  payload: z.record(z.unknown()),
  clientTimestamp: z.string().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('fishing.catches.read')
  const pending = await listPendingOffline(ctx.tenantId, ctx.userId)
  return jsonOk({ pending })
}, 'v2/offline/sync')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.catches.write')
  const body = await request.json()
  const action = (body as { action?: string }).action

  if (action === 'process') {
    const result = await processOfflineQueue(ctx.tenantId, ctx.userId)
    return jsonOk(result)
  }

  const input = enqueueSchema.parse(body)
  const id = await enqueueOfflineAction(
    ctx.tenantId,
    ctx.userId,
    input.deviceId,
    input.actionType,
    input.payload,
    input.clientTimestamp,
  )
  return jsonOk({ queued: true, id }, 201)
}, 'v2/offline/sync')

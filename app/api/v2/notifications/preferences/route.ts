import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from '@/lib/modules/notifications/service'

const updateSchema = z.object({
  channelEmail: z.boolean().optional(),
  channelSms: z.boolean().optional(),
  channelPush: z.boolean().optional(),
  channelWhatsapp: z.boolean().optional(),
  digest: z.enum(['instant', 'daily', 'weekly']).optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('notifications.preferences.read')
  const preferences = await getNotificationPreferences(ctx.tenantId, ctx.userId)
  return jsonOk({ preferences })
}, 'v2/notifications/preferences')

export const PUT = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.preferences.write')
  const body = await request.json()
  const input = updateSchema.parse(body)
  const preferences = await upsertNotificationPreferences(ctx.tenantId, ctx.userId, input)
  return jsonOk({ preferences })
}, 'v2/notifications/preferences')

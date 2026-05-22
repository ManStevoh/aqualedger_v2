import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/modules/notifications/service'
import { dispatchNotification } from '@/lib/notifications/dispatch'

const listQuerySchema = z.object({
  unreadOnly: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

const createSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.enum(['success', 'info', 'warning', 'error']).optional(),
  link: z.string().max(500).optional(),
  emitDomainEvent: z.boolean().optional(),
})

const patchSchema = z.object({
  id: z.string().uuid().optional(),
  markAllRead: z.boolean().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    unreadOnly: searchParams.get('unreadOnly') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const result = await listNotifications(ctx.tenantId, ctx.userId, {
    unreadOnly: parsed.unreadOnly === 'true',
    page: parsed.page,
    limit: parsed.limit,
  })

  return jsonOk(result)
}, 'v2/notifications')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.send')
  const body = await request.json()
  const input = createSchema.parse(body)

  const result = await dispatchNotification({
    tenantId: ctx.tenantId,
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link,
    emitDomainEvent: input.emitDomainEvent,
    aggregateType: 'notification',
    aggregateId: input.userId,
    eventType: 'notification.sent',
  })

  return jsonOk(result, 201)
}, 'v2/notifications')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('notifications.read')
  const body = await request.json()
  const input = patchSchema.parse(body)

  if (input.markAllRead) {
    await markAllNotificationsRead(ctx.tenantId, ctx.userId)
    return jsonOk({ markedAllRead: true })
  }

  if (!input.id) {
    throw new Error('id required when markAllRead is false')
  }

  await markNotificationRead(ctx.tenantId, ctx.userId, input.id)
  return jsonOk({ id: input.id, read: true })
}, 'v2/notifications')

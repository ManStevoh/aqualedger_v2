import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listChatSessions,
  getOrCreateSession,
  sendChatMessage,
} from '@/lib/modules/ai/chatbot'

const postSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.chat.read')
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId) {
    const session = await getOrCreateSession(ctx.tenantId, ctx.userId, sessionId)
    return jsonOk({ session })
  }

  const sessions = await listChatSessions(ctx.tenantId, ctx.userId)
  const session =
    sessions[0] ?? (await getOrCreateSession(ctx.tenantId, ctx.userId))
  return jsonOk({ sessions, session })
}, 'v2/ai/chat')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.chat.write')
  const body = await request.json()
  const { sessionId: requestedId, message } = postSchema.parse(body)

  const session = await getOrCreateSession(
    ctx.tenantId,
    ctx.userId,
    requestedId,
  )
  const updated = await sendChatMessage(
    ctx.tenantId,
    ctx.userId,
    session.id,
    message,
  )
  return jsonOk({ session: updated, aiMode: updated.aiMode })
}, 'v2/ai/chat')

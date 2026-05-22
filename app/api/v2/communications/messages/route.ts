import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listCommunicationMessages } from '@/lib/modules/communications/message-log'
import { sendCommunication, sendBulkEmail } from '@/lib/modules/communications/send'

const sendSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp']),
  recipient: z.string().min(3).optional(),
  recipients: z.array(z.string()).optional(),
  subject: z.string().max(255).optional(),
  body: z.string().min(1).max(50000),
  html: z.string().max(100000).optional(),
  messageType: z.string().max(80).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('communications.read')
  const { searchParams } = new URL(request.url)
  const messages = await listCommunicationMessages(ctx.tenantId, {
    channel: searchParams.get('channel') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    limit: Number(searchParams.get('limit') || 100),
  })
  return jsonOk({ messages })
}, 'v2/communications/messages')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('communications.send')
  const body = sendSchema.parse(await request.json())

  if (body.channel === 'email' && body.recipients?.length) {
    const result = await sendBulkEmail(
      ctx.tenantId,
      body.recipients,
      body.subject || 'Message from AquaERP',
      body.body,
      body.html,
      { messageType: body.messageType || 'broadcast' },
    )
    return jsonOk(result, 201)
  }

  if (!body.recipient) {
    const { conflict } = await import('@/lib/api-handler')
    throw conflict('recipient or recipients required')
  }

  const result = await sendCommunication({
    tenantId: ctx.tenantId,
    channel: body.channel,
    recipient: body.recipient,
    subject: body.subject,
    body: body.body,
    html: body.html,
    messageType: body.messageType,
  })
  return jsonOk({ result }, 201)
}, 'v2/communications/messages')

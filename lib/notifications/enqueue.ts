import { execute, generateId } from '@/lib/db'
import type { OutboxChannel } from './outbox-processor'

export interface EnqueueNotificationInput {
  tenantId: string
  channel: OutboxChannel
  recipient: string
  subject?: string | null
  body: string
}

export async function enqueueNotification(input: EnqueueNotificationInput): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO notification_outbox (id, tenant_id, channel, recipient, subject, body, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [id, input.tenantId, input.channel, input.recipient, input.subject ?? null, input.body],
  )
  return id
}

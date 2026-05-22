import { query, execute } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { sendEmail } from '@/lib/channels/email'
import { sendSms } from '@/lib/channels/sms'
import { sendWhatsApp } from '@/lib/channels/whatsapp'
import { sendPush } from '@/lib/channels/push'
import { logger } from '@/lib/logger'

export type OutboxChannel = 'email' | 'sms' | 'whatsapp' | 'push'

export interface NotificationOutboxRow {
  id: string
  tenant_id: string
  channel: OutboxChannel
  recipient: string
  subject: string | null
  body: string
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  last_error: string | null
  scheduled_at: string
  sent_at: string | null
  created_at: string
}

export interface ProcessOutboxResult {
  processed: number
  sent: number
  failed: number
}

export async function listPendingOutbox(
  tenantId: string,
  limit = 100,
): Promise<NotificationOutboxRow[]> {
  return query<NotificationOutboxRow>(
    `SELECT * FROM notification_outbox
     WHERE ${tenantWhere()} AND status = 'pending' AND scheduled_at <= NOW()
     ORDER BY scheduled_at ASC
     LIMIT ?`,
    [tenantId, limit],
  )
}

export async function processPendingOutbox(
  limit = 50,
  tenantId?: string,
): Promise<ProcessOutboxResult> {
  const conditions = [`status = 'pending'`, `scheduled_at <= NOW()`]
  const params: unknown[] = []

  if (tenantId) {
    conditions.push(tenantWhere())
    params.push(tenantId)
  }

  params.push(limit)

  const rows = await query<NotificationOutboxRow>(
    `SELECT * FROM notification_outbox
     WHERE ${conditions.join(' AND ')}
     ORDER BY scheduled_at ASC
     LIMIT ?`,
    params,
  )

  let processed = 0
  let sent = 0
  let failed = 0

  for (const row of rows) {
    processed++
    await execute(`UPDATE notification_outbox SET attempts = attempts + 1 WHERE id = ?`, [row.id])

    try {
      const result = await dispatchOutboxRow(row)

      if (result.sent) {
        await execute(
          `UPDATE notification_outbox
           SET status = 'sent', sent_at = NOW(), last_error = NULL
           WHERE id = ?`,
          [row.id],
        )
        sent++
      } else {
        await execute(
          `UPDATE notification_outbox
           SET status = 'failed', last_error = ?
           WHERE id = ?`,
          [(result.error || 'Send failed').slice(0, 500), row.id],
        )
        failed++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Outbox row failed', { outboxId: row.id, error: msg })
      await execute(
        `UPDATE notification_outbox SET status = 'failed', last_error = ? WHERE id = ?`,
        [msg.slice(0, 500), row.id],
      )
      failed++
    }
  }

  return { processed, sent, failed }
}

async function dispatchOutboxRow(row: NotificationOutboxRow) {
  switch (row.channel) {
    case 'email':
      return sendEmail({
        to: row.recipient,
        subject: row.subject || 'AquaERP',
        body: row.body,
      })
    case 'sms':
      return sendSms({ to: row.recipient, body: row.body })
    case 'whatsapp':
      return sendWhatsApp({ to: row.recipient, body: row.body })
    case 'push':
      return sendPush({
        to: row.recipient,
        title: row.subject || 'AquaERP',
        body: row.body,
      })
    default:
      return { sent: false, error: `Unsupported channel: ${row.channel}` }
  }
}

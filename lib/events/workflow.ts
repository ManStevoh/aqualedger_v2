import { query, execute, generateId } from '@/lib/db'
import { dispatchNotification } from '@/lib/notifications/dispatch'
import { logger } from '@/lib/logger'

export interface DomainEventRow {
  id: string
  tenant_id: string
  event_type: string
  aggregate_type: string
  aggregate_id: string
  payload: string | Record<string, unknown> | null
  status: string
}

export async function publishDomainEvent(input: {
  tenantId: string
  eventType: string
  aggregateType: string
  aggregateId: string
  payload?: Record<string, unknown>
}): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO domain_events (id, tenant_id, event_type, aggregate_type, aggregate_id, payload, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      input.tenantId,
      input.eventType,
      input.aggregateType,
      input.aggregateId,
      input.payload ? JSON.stringify(input.payload) : null,
    ],
  )
  return id
}

/** Process pending domain events (call from cron or after mutations) */
export async function processPendingEvents(limit = 50): Promise<number> {
  const events = await query<DomainEventRow>(
    `SELECT * FROM domain_events WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?`,
    [limit],
  )

  let processed = 0
  for (const ev of events) {
    try {
      await handleEvent(ev)
      await execute(
        `UPDATE domain_events SET status = 'processed', processed_at = NOW() WHERE id = ?`,
        [ev.id],
      )
      processed++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Workflow event failed', { eventId: ev.id, error: msg })
      await execute(`UPDATE domain_events SET status = 'failed' WHERE id = ?`, [ev.id])
    }
  }
  return processed
}

async function handleEvent(ev: DomainEventRow): Promise<void> {
  const payload =
    typeof ev.payload === 'string'
      ? (JSON.parse(ev.payload) as Record<string, unknown>)
      : (ev.payload as Record<string, unknown>) || {}

  const rules = await query<{
    id: string
    actions: string | Record<string, unknown>[]
  }>(
    `SELECT id, actions FROM workflow_rules WHERE tenant_id = ? AND trigger_event = ? AND active = 1`,
    [ev.tenant_id, ev.event_type],
  )

  for (const rule of rules) {
    const actions =
      typeof rule.actions === 'string'
        ? (JSON.parse(rule.actions) as Record<string, unknown>[])
        : (rule.actions as Record<string, unknown>[]) || []

    for (const action of actions) {
      if (action.type === 'notification') {
        const channel = String(action.channel || 'in_app')
        const userId = String(payload.userId || payload.user_id || '')
        if (channel === 'in_app' && userId) {
          await dispatchNotification({
            tenantId: ev.tenant_id,
            userId,
            type: 'info',
            title: String(payload.title || 'Workflow alert'),
            message: String(payload.message || ev.event_type),
          })
        } else if (['email', 'sms', 'whatsapp'].includes(channel)) {
          await execute(
            `INSERT INTO notification_outbox (id, tenant_id, channel, recipient, subject, body, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [
              generateId(),
              ev.tenant_id,
              channel,
              String(payload.recipient || payload.email || payload.phone || 'unknown'),
              String(payload.subject || payload.title || 'AquaERP'),
              String(payload.message || ev.event_type),
            ],
          )
        }
      }
    }
  }
}

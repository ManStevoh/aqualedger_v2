import { execute, generateId } from '@/lib/db'

export interface DispatchNotificationInput {
  tenantId: string
  userId: string
  title: string
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  link?: string
  emitDomainEvent?: boolean
  eventType?: string
  aggregateType?: string
  aggregateId?: string
  payload?: Record<string, unknown>
}

export interface DispatchNotificationResult {
  notificationId: string
  domainEventId?: string
}

export async function dispatchNotification(
  input: DispatchNotificationInput,
): Promise<DispatchNotificationResult> {
  const notificationId = generateId()

  await execute(
    `INSERT INTO notifications (id, tenant_id, user_id, type, title, message, action_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      notificationId,
      input.tenantId,
      input.userId,
      input.type ?? 'info',
      input.title,
      input.message,
      input.link ?? null,
    ],
  )

  let domainEventId: string | undefined

  if (input.emitDomainEvent && input.aggregateType && input.aggregateId) {
    domainEventId = generateId()
    await execute(
      `INSERT INTO domain_events
       (id, tenant_id, event_type, aggregate_type, aggregate_id, payload, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        domainEventId,
        input.tenantId,
        input.eventType ?? 'notification.sent',
        input.aggregateType,
        input.aggregateId,
        JSON.stringify({
          notificationId,
          title: input.title,
          message: input.message,
          ...input.payload,
        }),
      ],
    )
  }

  return { notificationId, domainEventId }
}

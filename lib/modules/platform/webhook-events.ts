import { execute, generateId } from '@/lib/db'

export async function logWebhookEvent(input: {
  provider: string
  eventType: string
  externalId?: string | null
  status?: 'received' | 'processed' | 'failed'
  payload?: unknown
  errorMessage?: string | null
}): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO platform_webhook_events
     (id, provider, event_type, external_id, status, payload, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.provider,
      input.eventType,
      input.externalId ?? null,
      input.status ?? 'received',
      input.payload ? JSON.stringify(input.payload) : null,
      input.errorMessage ?? null,
    ],
  )
  return id
}

export async function markWebhookEvent(
  id: string,
  status: 'processed' | 'failed',
  errorMessage?: string,
): Promise<void> {
  await execute(
    `UPDATE platform_webhook_events SET status = ?, error_message = ? WHERE id = ?`,
    [status, errorMessage ?? null, id],
  )
}

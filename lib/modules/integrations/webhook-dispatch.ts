import crypto from 'crypto'
import { query, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { logger } from '@/lib/logger'

export interface WebhookPayload {
  id: string
  event: string
  created_at: string
  tenant_id: string
  data: Record<string, unknown>
}

function signPayload(secret: string, timestamp: string, body: string): string {
  const signed = `${timestamp}.${body}`
  return crypto.createHmac('sha256', secret).update(signed).digest('hex')
}

export async function dispatchWebhooksForEvent(
  tenantId: string,
  eventType: string,
  data: Record<string, unknown>,
): Promise<{ delivered: number; failed: number }> {
  const endpoints = await query<{
    id: string
    url: string
    events: string | string[]
    secret_hash: string | null
  }>(
    `SELECT id, url, events, secret_hash FROM webhook_endpoints
     WHERE ${tenantWhere()} AND status = 'active'`,
    [tenantId],
  )

  let delivered = 0
  let failed = 0

  const payload: WebhookPayload = {
    id: generateId(),
    event: eventType,
    created_at: new Date().toISOString(),
    tenant_id: tenantId,
    data,
  }

  const body = JSON.stringify(payload)
  const timestamp = Math.floor(Date.now() / 1000).toString()

  for (const ep of endpoints) {
    let events: string[] = []
    try {
      events = typeof ep.events === 'string' ? JSON.parse(ep.events) : ep.events
    } catch {
      events = []
    }
    if (!events.includes(eventType) && !events.includes('*') && !events.includes('report.*')) {
      continue
    }

    const secret =
      ep.secret_hash ||
      process.env.WEBHOOK_SIGNING_SECRET ||
      process.env.JWT_SECRET ||
      'dev-webhook-secret'
    const signature = signPayload(secret, timestamp, body)

    let responseStatus: number | null = null
    let responseBody = ''
    let success = false

    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AquaERP-Webhooks/1.0',
          'X-AquaERP-Event': eventType,
          'X-AquaERP-Timestamp': timestamp,
          'X-AquaERP-Signature': `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(15000),
      })
      responseStatus = res.status
      responseBody = (await res.text()).slice(0, 1000)
      success = res.ok
      if (success) delivered++
      else failed++
    } catch (err) {
      responseBody = err instanceof Error ? err.message : 'Request failed'
      failed++
    }

    await execute(
      `INSERT INTO webhook_delivery_log (id, tenant_id, webhook_id, event_type, payload, response_status, response_body, success)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        tenantId,
        ep.id,
        eventType,
        body,
        responseStatus,
        responseBody,
        success ? 1 : 0,
      ],
    )

    logger.info('webhook_delivery', {
      webhookId: ep.id,
      eventType,
      success,
      status: responseStatus,
    })
  }

  return { delivered, failed }
}

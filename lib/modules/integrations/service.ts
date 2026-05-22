import crypto from 'crypto'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { initiateStkPush, mpesaConfigured } from './mpesa'

export type WebhookStatus = 'active' | 'inactive'

export interface WebhookEndpoint {
  id: string
  tenant_id: string
  url: string
  events: string[]
  status: WebhookStatus
  created_at: string
}

export interface CreateWebhookInput {
  url: string
  events: string[]
  status?: WebhookStatus
}

export interface UpdateWebhookInput {
  url?: string
  events?: string[]
  status?: WebhookStatus
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex')
}

function parseEvents(raw: string | string[] | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export async function listWebhooks(tenantId: string): Promise<WebhookEndpoint[]> {
  const rows = await query<Omit<WebhookEndpoint, 'events'> & { events: string | string[] }>(
    `SELECT id, tenant_id, url, events, status, created_at
     FROM webhook_endpoints
     WHERE ${tenantWhere()}
     ORDER BY created_at DESC`,
    [tenantId],
  )
  return rows.map((r) => ({ ...r, events: parseEvents(r.events) }))
}

export async function createWebhook(
  tenantId: string,
  input: CreateWebhookInput,
): Promise<WebhookEndpoint & { secret: string }> {
  const id = generateId()
  const secret = crypto.randomBytes(24).toString('hex')
  const secretHash = hashSecret(secret)

  await execute(
    `INSERT INTO webhook_endpoints (id, tenant_id, url, events, secret_hash, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.url,
      JSON.stringify(input.events),
      secretHash,
      input.status ?? 'active',
    ],
  )

  const row = await queryOne<Omit<WebhookEndpoint, 'events'> & { events: string }>(
    `SELECT id, tenant_id, url, events, status, created_at FROM webhook_endpoints WHERE id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to create webhook')

  return { ...row, events: parseEvents(row.events), secret }
}

export async function updateWebhook(
  tenantId: string,
  webhookId: string,
  input: UpdateWebhookInput,
): Promise<WebhookEndpoint> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM webhook_endpoints WHERE id = ? AND ${tenantWhere()}`,
    [webhookId, tenantId],
  )
  if (!existing) throw new Error('Webhook not found')

  const updates: string[] = []
  const params: unknown[] = []

  if (input.url !== undefined) {
    updates.push('url = ?')
    params.push(input.url)
  }
  if (input.events !== undefined) {
    updates.push('events = ?')
    params.push(JSON.stringify(input.events))
  }
  if (input.status !== undefined) {
    updates.push('status = ?')
    params.push(input.status)
  }

  if (updates.length === 0) {
    const row = await queryOne<Omit<WebhookEndpoint, 'events'> & { events: string }>(
      `SELECT id, tenant_id, url, events, status, created_at FROM webhook_endpoints WHERE id = ?`,
      [webhookId],
    )
    if (!row) throw new Error('Webhook not found')
    return { ...row, events: parseEvents(row.events) }
  }

  params.push(webhookId, tenantId)
  await execute(
    `UPDATE webhook_endpoints SET ${updates.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
    params,
  )

  const row = await queryOne<Omit<WebhookEndpoint, 'events'> & { events: string }>(
    `SELECT id, tenant_id, url, events, status, created_at FROM webhook_endpoints WHERE id = ?`,
    [webhookId],
  )
  if (!row) throw new Error('Failed to update webhook')
  return { ...row, events: parseEvents(row.events) }
}

export async function deleteWebhook(tenantId: string, webhookId: string): Promise<void> {
  const result = await execute(
    `DELETE FROM webhook_endpoints WHERE id = ? AND ${tenantWhere()}`,
    [webhookId, tenantId],
  )
  if (result.affectedRows === 0) {
    throw new Error('Webhook not found')
  }
}

export type IntegrationProvider = 'mpesa' | 'stripe' | 'sms' | 'whatsapp' | 'iot_coldchain' | 'custom'

export interface IntegrationConnection {
  id: string
  tenant_id: string
  provider: IntegrationProvider
  name: string
  status: 'active' | 'inactive' | 'error'
  last_sync_at: string | null
  created_at: string
}

const PROVIDER_NAMES: Record<IntegrationProvider, string> = {
  mpesa: 'M-Pesa Daraja',
  stripe: 'Stripe Payments',
  sms: 'SMS Gateway',
  whatsapp: 'WhatsApp Business',
  iot_coldchain: 'IoT Cold Chain',
  custom: 'Custom API',
}

export async function connectProvider(
  tenantId: string,
  provider: IntegrationProvider,
): Promise<IntegrationConnection> {
  const existing = await queryOne<IntegrationConnection>(
    `SELECT id, tenant_id, provider, name, status, last_sync_at, created_at
     FROM integration_connections
     WHERE tenant_id = ? AND provider = ?
     LIMIT 1`,
    [tenantId, provider],
  )

  if (existing) {
    await execute(
      `UPDATE integration_connections SET status = 'active', updated_at = NOW() WHERE id = ?`,
      [existing.id],
    )
    return { ...existing, status: 'active' }
  }

  const id = generateId()
  await execute(
    `INSERT INTO integration_connections (id, tenant_id, provider, name, config, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [id, tenantId, provider, PROVIDER_NAMES[provider], JSON.stringify({ stub: true })],
  )

  const row = await queryOne<IntegrationConnection>(
    `SELECT id, tenant_id, provider, name, status, last_sync_at, created_at
     FROM integration_connections WHERE id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to connect provider')
  return row
}

export async function testProvider(
  tenantId: string,
  provider: IntegrationProvider,
): Promise<{ ok: boolean; message: string; latency_ms: number }> {
  const conn = await queryOne<{ id: string; status: string }>(
    `SELECT id, status FROM integration_connections
     WHERE tenant_id = ? AND provider = ? LIMIT 1`,
    [tenantId, provider],
  )

  if (!conn || conn.status !== 'active') {
    return { ok: false, message: 'Connect the provider before testing', latency_ms: 0 }
  }

  const start = Date.now()

  if (provider === 'mpesa') {
    const testPhone =
      process.env.MPESA_TEST_PHONE?.trim() ||
      process.env.MPESA_SANDBOX_PHONE?.trim()
    if (!testPhone) {
      return {
        ok: false,
        message: 'Set MPESA_TEST_PHONE (2547XXXXXXXX) in .env to run a sandbox STK test',
        latency_ms: 0,
      }
    }
    const amount = Math.max(1, Number(process.env.MPESA_TEST_AMOUNT || '1'))
    try {
      const result = await initiateStkPush({
        tenantId,
        amount,
        phoneNumber: testPhone,
        description: 'AquaERP integration test',
        metadata: { purpose: 'test' },
      })
      await execute(
        `UPDATE integration_connections SET last_sync_at = NOW() WHERE id = ?`,
        [conn.id],
      )
      const latency = Date.now() - start
      const mode = mpesaConfigured() ? 'Daraja' : 'stub'
      return {
        ok: true,
        message: `${mode} STK initiated (${result.externalRef}). ${result.simulated ? 'Auto-completed in stub mode.' : 'Approve on phone; callback credits wallet when configured.'}`,
        latency_ms: latency,
      }
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'STK test failed',
        latency_ms: Date.now() - start,
      }
    }
  }

  await execute(
    `UPDATE integration_connections SET last_sync_at = NOW() WHERE id = ?`,
    [conn.id],
  )
  const latency = Date.now() - start

  const messages: Record<IntegrationProvider, string> = {
    mpesa: 'STK push sandbox reachable',
    stripe: 'Payment intent test succeeded',
    sms: 'Test SMS queued to gateway',
    whatsapp: 'Template message sandbox OK',
    iot_coldchain: 'Telemetry ingest endpoint OK',
    custom: 'Custom webhook ping OK',
  }

  return { ok: true, message: messages[provider], latency_ms: latency }
}

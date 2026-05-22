import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export type ConnectorType = 'erp' | 'shipping' | 'whatsapp' | 'accounting'

export async function listConnectors(tenantId: string, type?: ConnectorType) {
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]
  if (type) {
    conditions.push('connector_type = ?')
    params.push(type)
  }
  return query(
    `SELECT * FROM integration_connectors WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params,
  )
}

export async function upsertConnector(
  tenantId: string,
  input: {
    connectorType: ConnectorType
    provider: string
    config?: Record<string, unknown>
  },
) {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM integration_connectors
     WHERE ${tenantWhere()} AND connector_type = ? AND provider = ?`,
    [tenantId, input.connectorType, input.provider],
  )

  const configJson = JSON.stringify(input.config ?? {})

  if (existing) {
    await execute(
      `UPDATE integration_connectors SET config = ?, status = 'inactive', last_error = NULL WHERE id = ?`,
      [configJson, existing.id],
    )
    return existing.id
  }

  const id = generateId()
  await execute(
    `INSERT INTO integration_connectors (id, tenant_id, connector_type, provider, config, status)
     VALUES (?, ?, ?, ?, ?, 'inactive')`,
    [id, tenantId, input.connectorType, input.provider, configJson],
  )
  return id
}

export async function syncConnector(tenantId: string, connectorId: string) {
  const row = await queryOne<{ id: string; connector_type: string; provider: string }>(
    `SELECT id, connector_type, provider FROM integration_connectors WHERE id = ? AND ${tenantWhere()}`,
    [connectorId, tenantId],
  )
  if (!row) return null

  await execute(
    `UPDATE integration_connectors SET last_sync_at = NOW(), status = 'active', last_error = NULL WHERE id = ?`,
    [connectorId],
  )

  return {
    connectorId,
    type: row.connector_type,
    provider: row.provider,
    syncedAt: new Date().toISOString(),
    recordsProcessed: 0,
    message: `${row.provider} sync queued — configure live credentials in connector config`,
  }
}

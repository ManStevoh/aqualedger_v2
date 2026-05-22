import { query, queryOne, generateId } from './db'
import { logger } from './logger'

let auditTenantIdColumn: boolean | null = null

async function auditLogsHasTenantId(): Promise<boolean> {
  if (auditTenantIdColumn !== null) return auditTenantIdColumn
  const row = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_logs' AND COLUMN_NAME = 'tenant_id'`,
  )
  auditTenantIdColumn = Number(row?.cnt ?? 0) > 0
  return auditTenantIdColumn
}

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'user.create'
  | 'user.update'
  | 'user.suspend'
  | 'wallet.transfer'
  | 'wallet.deposit'
  | 'wallet.withdraw'
  | 'license.issue'
  | 'license.suspend'
  | 'license.revoke'
  | 'boat.create'
  | 'boat.update'
  | 'boat.delete'
  | 'admin.action'
  | 'platform.impersonate.start'
  | 'platform.impersonate.end'
  | 'platform.tenant.provision'
  | 'platform.broadcast'
  | 'platform.tenant.purge'

export async function logAudit(params: {
  userId?: string | null
  tenantId?: string | null
  action: AuditAction
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  try {
    const id = generateId()
    const baseParams = [
      id,
      params.userId ?? null,
      params.action,
      params.resourceType ?? null,
      params.resourceId ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.ipAddress ?? null,
      params.userAgent ?? null,
    ]

    if (params.tenantId && (await auditLogsHasTenantId())) {
      await query(
        `INSERT INTO audit_logs (id, user_id, tenant_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, params.userId ?? null, params.tenantId, ...baseParams.slice(2)],
      )
    } else {
      await query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        baseParams,
      )
    }
  } catch (error) {
    logger.warn('Audit log write failed', {
      action: params.action,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

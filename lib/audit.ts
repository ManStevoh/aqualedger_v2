import { query, generateId } from './db'
import { logger } from './logger'

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

export async function logAudit(params: {
  userId?: string | null
  action: AuditAction
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        params.userId ?? null,
        params.action,
        params.resourceType ?? null,
        params.resourceId ?? null,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
      ],
    )
  } catch (error) {
    logger.warn('Audit log write failed', {
      action: params.action,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

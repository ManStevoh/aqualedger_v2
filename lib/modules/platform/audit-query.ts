import { query } from '@/lib/db'

export async function listAuditLogs(opts: {
  tenantId?: string
  userId?: string
  action?: string
  limit?: number
  page?: number
  platformScope?: boolean
}) {
  const limit = Math.min(opts.limit || 50, 200)
  const page = opts.page || 1
  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[] = []

  if (!opts.platformScope) {
    if (opts.tenantId) {
      conditions.push(
        '(al.tenant_id = ? OR al.user_id IN (SELECT user_id FROM tenant_members WHERE tenant_id = ?))',
      )
      params.push(opts.tenantId, opts.tenantId)
    }
  } else if (opts.tenantId) {
    conditions.push('al.tenant_id = ?')
    params.push(opts.tenantId)
  }

  if (opts.userId) {
    conditions.push('al.user_id = ?')
    params.push(opts.userId)
  }
  if (opts.action) {
    conditions.push('al.action LIKE ?')
    params.push(`${opts.action}%`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const logs = await query(
    `SELECT al.*, u.email AS user_email, tn.name AS tenant_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     LEFT JOIN tenants tn ON al.tenant_id = tn.id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  return logs
}

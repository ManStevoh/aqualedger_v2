import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function listCommunicationMessages(
  tenantId: string,
  opts: { channel?: string; status?: string; limit?: number } = {},
) {
  const limit = Math.min(opts.limit ?? 100, 200)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.channel) {
    conditions.push('channel = ?')
    params.push(opts.channel)
  }
  if (opts.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }

  params.push(limit)

  return query(
    `SELECT * FROM communication_messages
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT ?`,
    params,
  )
}

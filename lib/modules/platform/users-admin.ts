import { query, queryOne } from '@/lib/db'

export interface PlatformUserRow {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  createdAt: Date
  tenantCount: number
  tenantLabels: string | null
  lastLogin: string | null
}

export async function listPlatformUsers(opts: {
  search?: string
  limit?: number
  page?: number
}): Promise<{ users: PlatformUserRow[]; total: number; page: number; limit: number }> {
  const limit = Math.min(opts.limit || 50, 200)
  const page = Math.max(opts.page || 1, 1)
  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[] = []

  if (opts.search?.trim()) {
    const term = `%${opts.search.trim()}%`
    conditions.push('(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)')
    params.push(term, term, term)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    params,
  )

  const rows = await query<{
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    status: string
    created_at: Date
    tenant_count: number
    tenant_labels: string | null
    last_login: Date | null
  }>(
    `SELECT
       u.id,
       u.email,
       u.first_name,
       u.last_name,
       u.role,
       u.status,
       u.created_at,
       u.last_login,
       (SELECT COUNT(*) FROM tenant_members tm WHERE tm.user_id = u.id) AS tenant_count,
       (SELECT GROUP_CONCAT(CONCAT(t.name, ' (', t.slug, ')') ORDER BY tm.joined_at SEPARATOR ' · ')
        FROM tenant_members tm
        INNER JOIN tenants t ON t.id = tm.tenant_id
        WHERE tm.user_id = u.id
        LIMIT 5) AS tenant_labels
     FROM users u
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  return {
    users: rows.map((r) => ({
      id: r.id,
      email: r.email,
      firstName: r.first_name,
      lastName: r.last_name,
      role: r.role,
      status: r.status,
      createdAt: r.created_at,
      tenantCount: Number(r.tenant_count),
      tenantLabels: r.tenant_labels,
      lastLogin: r.last_login
        ? r.last_login instanceof Date
          ? r.last_login.toISOString()
          : String(r.last_login)
        : null,
    })),
    total: Number(countRow?.total ?? 0),
    page,
    limit,
  }
}

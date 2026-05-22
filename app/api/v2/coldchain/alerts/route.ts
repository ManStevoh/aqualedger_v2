import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { query, buildPagination } from '@/lib/db'
import { requirePermission } from '@/lib/platform/access'
import { tenantWhere } from '@/lib/tenant'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.alerts.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const resolved = searchParams.get('resolved')
  const pagination = buildPagination(page, limit)

  const conditions: string[] = [tenantWhere('ca')]
  const params: unknown[] = [ctx.tenantId]

  if (resolved === 'true') {
    conditions.push('ca.resolved = 1')
  } else if (resolved === 'false') {
    conditions.push('ca.resolved = 0')
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM coldchain_alerts ca ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const alerts = await query(
    `SELECT ca.*, sf.name as facility_name
     FROM coldchain_alerts ca
     LEFT JOIN storage_facilities sf ON ca.facility_id = sf.id
     ${where}
     ORDER BY ca.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return jsonOk({
    alerts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  })
}, 'v2/coldchain/alerts')

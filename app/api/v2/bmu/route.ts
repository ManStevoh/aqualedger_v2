import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { pushTenantCondition } from '@/lib/tenant-scope'

export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.bmu.read')
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource') || 'bmus'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const pagination = buildPagination(page, limit)

    if (resource === 'licenses') {
      const status = searchParams.get('status')
      const conditions: string[] = []
      const params: unknown[] = []
      pushTenantCondition(conditions, params, 'l', auth.tenantId)
      if (status) {
        conditions.push('l.status = ?')
        params.push(status === 'valid' ? 'active' : status)
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

      const [countRow] = await query<{ total: number }>(
        `SELECT COUNT(*) as total FROM licenses l ${where}`,
        params,
      )
      const total = countRow?.total || 0

      const rows = await query(
        `SELECT l.*, CONCAT(u.first_name, ' ', u.last_name) as holder_name, u.email as holder_email
         FROM licenses l
         JOIN users u ON l.user_id = u.id
         ${where}
         ORDER BY l.expires_date ASC
         ${pagination.clause}`,
        params,
      )

      return NextResponse.json({
        success: true,
        data: {
          licenses: rows,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        },
      })
    }

    const county = searchParams.get('region') || searchParams.get('county')
    const status = searchParams.get('status')
    const conditions: string[] = []
    const params: unknown[] = []
    pushTenantCondition(conditions, params, 'b', auth.tenantId)
    if (county) {
      conditions.push('b.county = ?')
      params.push(county)
    }
    if (status) {
      conditions.push('b.status = ?')
      params.push(status)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM bmu b ${where}`,
      params,
    )
    const total = countRow?.total || 0

    const rows = await query(
      `SELECT b.*, CONCAT(uc.first_name, ' ', uc.last_name) as chairman_name,
        COALESCE(catch_agg.total_catches, 0) as total_catches,
        COALESCE(catch_agg.total_catch_kg, 0) as total_catch_kg,
        COALESCE(catch_agg.total_revenue, 0) as catch_revenue,
        COALESCE(license_agg.active_licenses, 0) as active_licenses,
        COALESCE(license_agg.expiring_licenses, 0) as expiring_licenses,
        COALESCE(license_agg.expired_licenses, 0) as expired_licenses
       FROM bmu b
       LEFT JOIN users uc ON b.chairman_id = uc.id
       LEFT JOIN (
         SELECT ls.bmu_id,
           COUNT(c.id) as total_catches,
           COALESCE(SUM(c.quantity_kg), 0) as total_catch_kg,
           COALESCE(SUM(c.quantity_kg * c.unit_price), 0) as total_revenue
         FROM catches c
         JOIN fishing_trips ft ON c.trip_id = ft.id
         JOIN boats bt ON ft.boat_id = bt.id
         JOIN landing_sites ls ON ft.landing_site_id = ls.id
         WHERE ls.bmu_id IS NOT NULL
         GROUP BY ls.bmu_id
       ) catch_agg ON catch_agg.bmu_id = b.id
       LEFT JOIN (
         SELECT ls2.bmu_id,
           SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_licenses,
           SUM(CASE WHEN l.status = 'active' AND l.expires_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_licenses,
           SUM(CASE WHEN l.status = 'expired' THEN 1 ELSE 0 END) as expired_licenses
         FROM licenses l
         JOIN users u2 ON l.user_id = u2.id
         JOIN boat_crew bc ON bc.crew_member_id = u2.id
         JOIN boats bt2 ON bc.boat_id = bt2.id
         JOIN landing_sites ls2 ON bt2.id = bt2.id AND ls2.bmu_id IS NOT NULL
         WHERE ls2.bmu_id IS NOT NULL
         GROUP BY ls2.bmu_id
       ) license_agg ON license_agg.bmu_id = b.id
       ${where}
       ORDER BY b.name ASC
       ${pagination.clause}`,
      params,
    )

    return NextResponse.json({
      success: true,
      data: {
        bmus: rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/bmu')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.bmu.write')
    const body = await request.json()
    const name = (body.name as string)?.trim()
    const code = (body.code as string)?.trim()
    const county = (body.county as string)?.trim()

    if (!name || !code || !county) {
      return NextResponse.json(
        { success: false, error: 'Name, code, and county are required' },
        { status: 400 },
      )
    }

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM bmu WHERE code = ? AND tenant_id = ?',
      [code, auth.tenantId],
    )
    if (existing) {
      return NextResponse.json({ success: false, error: 'BMU code already exists' }, { status: 409 })
    }

    const id = generateId()
    await execute(
      `INSERT INTO bmu (id, tenant_id, name, code, county, status, total_members, total_boats, registration_date)
       VALUES (?, ?, ?, ?, ?, 'active', 0, 0, CURDATE())`,
      [id, auth.tenantId, name, code, county],
    )

    const bmu = await queryOne('SELECT * FROM bmu WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: { bmu } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/bmu')
  }
}

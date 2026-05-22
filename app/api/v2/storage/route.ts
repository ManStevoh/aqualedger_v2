import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { pushTenantCondition } from '@/lib/tenant-scope'

export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('coldchain.facilities.read')
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('type') || 'units'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const pagination = buildPagination(page, limit)

    if (resource === 'records') {
      const facilityId = searchParams.get('unitId') || searchParams.get('facilityId')
      const status = searchParams.get('status')

      const conditions: string[] = []
      const params: unknown[] = []
      pushTenantCondition(conditions, params, 'sr', auth.tenantId)
      if (facilityId) {
        conditions.push('sr.facility_id = ?')
        params.push(facilityId)
      }
      if (status) {
        conditions.push('sr.status = ?')
        params.push(status)
      }
      const where = `WHERE ${conditions.join(' AND ')}`

      const [countRow] = await query<{ total: number }>(
        `SELECT COUNT(*) as total FROM storage_records sr ${where}`,
        params,
      )
      const total = countRow?.total || 0

      const rows = await query(
        `SELECT sr.*, sf.name as facility_name, fs.name as species_name
         FROM storage_records sr
         LEFT JOIN storage_facilities sf ON sr.facility_id = sf.id
         LEFT JOIN fish_species fs ON sr.species_id = fs.id
         ${where}
         ORDER BY sr.entry_date DESC
         ${pagination.clause}`,
        params,
      )

      return NextResponse.json({
        success: true,
        data: {
          records: rows,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        },
      })
    }

    const status = searchParams.get('status')
    const conditions: string[] = []
    const params: unknown[] = []
    pushTenantCondition(conditions, params, 'sf', auth.tenantId)
    if (status) {
      conditions.push('sf.status = ?')
      params.push(status)
    }
    const where = `WHERE ${conditions.join(' AND ')}`

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM storage_facilities sf ${where}`,
      params,
    )
    const total = countRow?.total || 0

    const facilities = await query(
      `SELECT sf.*, CONCAT(u.first_name, ' ', u.last_name) as manager_name
       FROM storage_facilities sf
       LEFT JOIN users u ON sf.manager_id = u.id
       ${where}
       ORDER BY sf.name ASC
       ${pagination.clause}`,
      params,
    )

    const cap = await query<{ cap: number; used: number }>(
      `SELECT COALESCE(SUM(capacity_kg),0) as cap, COALESCE(SUM(current_stock_kg),0) as used
       FROM storage_facilities sf ${where}`,
      params,
    )
    const c = cap[0]

    return NextResponse.json({
      success: true,
      data: {
        facilities,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        totalCapacity: Number(c?.cap) || 0,
        usedCapacity: Number(c?.used) || 0,
        utilizationRate: c?.cap ? (Number(c.used) / Number(c.cap)) * 100 : 0,
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/storage')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('coldchain.records.write')
    const body = await request.json()
    const name = (body.name as string)?.trim()
    const code = (body.code as string)?.trim()
    const county = (body.county as string)?.trim()
    const capacityKg = Number(body.capacityKg)
    const type = (body.type as string) || 'cold_room'

    if (!name || !code || !county || !capacityKg) {
      return NextResponse.json(
        { success: false, error: 'Name, code, county, and capacity are required' },
        { status: 400 },
      )
    }

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM storage_facilities WHERE code = ? AND tenant_id = ?',
      [code, auth.tenantId],
    )
    if (existing) {
      return NextResponse.json({ success: false, error: 'Facility code already exists' }, { status: 409 })
    }

    const id = generateId()
    await execute(
      `INSERT INTO storage_facilities (
        id, tenant_id, name, code, type, capacity_kg, current_stock_kg, county, status, manager_id, daily_rate_per_kg
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'operational', ?, ?)`,
      [
        id,
        auth.tenantId,
        name,
        code,
        type,
        capacityKg,
        county,
        auth.userId,
        Number(body.dailyRatePerKg) || 0,
      ],
    )

    const facility = await queryOne('SELECT * FROM storage_facilities WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: { facility } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/storage')
  }
}

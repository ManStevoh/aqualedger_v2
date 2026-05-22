import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, execute, generateId } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { pushTenantCondition } from '@/lib/tenant-scope'

export async function GET() {
  try {
    const auth = await withApiPermission('fishing.landing.read')
    const conditions: string[] = ["ls.status = 'active'"]
    const params: unknown[] = []
    pushTenantCondition(conditions, params, 'ls', auth.tenantId)
    const where = `WHERE ${conditions.join(' AND ')}`

    const sites = await query(
      `SELECT ls.*, b.name as bmu_name, b.code as bmu_code
       FROM landing_sites ls
       LEFT JOIN bmu b ON ls.bmu_id = b.id
       ${where}
       ORDER BY ls.county, ls.name`,
      params,
    )
    return NextResponse.json({ success: true, data: { sites } })
  } catch (error) {
    return handleApiError(error, 'v2/landing-sites')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.landing.write')
    const body = await request.json()
    const name = (body.name as string)?.trim()
    const county = (body.county as string)?.trim()
    const bmuId = (body.bmuId as string)?.trim() || null
    const code = (body.code as string)?.trim() || null
    const latitude = body.latitude != null ? Number(body.latitude) : null
    const longitude = body.longitude != null ? Number(body.longitude) : null

    if (!name || !county) {
      return NextResponse.json({ success: false, error: 'Name and county are required' }, { status: 400 })
    }

    const id = generateId()
    await execute(
      `INSERT INTO landing_sites (id, tenant_id, name, code, county, latitude, longitude, bmu_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [id, auth.tenantId, name, code, county, latitude, longitude, bmuId],
    )

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/landing-sites')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'

const typeMap: Record<string, string> = {
  scheduled: 'routine',
  emergency: 'emergency',
  inspection: 'inspection',
  routine: 'routine',
  repair: 'repair',
  overhaul: 'overhaul',
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    const boatId = searchParams.get('boatId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const pagination = buildPagination(page, limit)

    const conditions: string[] = []
    const params: unknown[] = []

    if (!hasFullSystemAccess(auth.role) && auth.role !== 'bmu_official') {
      conditions.push('b.owner_id = ?')
      params.push(auth.userId)
    }

    if (boatId) {
      conditions.push('m.boat_id = ?')
      params.push(boatId)
    }
    if (status) {
      conditions.push('m.status = ?')
      params.push(status)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM boat_maintenance m
       LEFT JOIN boats b ON m.boat_id = b.id
       ${where}`,
      params,
    )
    const total = countRow?.total || 0

    const rows = await query(
      `SELECT m.*, b.name as boat_name, b.registration_number
       FROM boat_maintenance m
       LEFT JOIN boats b ON m.boat_id = b.id
       ${where}
       ORDER BY m.maintenance_date DESC, m.created_at DESC
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
  } catch (error) {
    return handleApiError(error, 'v2/maintenance')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const body = await request.json()
    const boatId = body.boatId as string
    const rawType = (body.type as string) || 'routine'
    const description = body.description as string
    const cost = Number(body.cost) || 0
    const scheduledDate = (body.scheduledDate as string) || new Date().toISOString().split('T')[0]

    if (!boatId || !description) {
      return NextResponse.json({ success: false, error: 'Boat and description required' }, { status: 400 })
    }

    const boat = await queryOne<{ id: string; owner_id: string }>(
      'SELECT id, owner_id FROM boats WHERE id = ?',
      [boatId],
    )
    if (!boat) {
      return NextResponse.json({ success: false, error: 'Boat not found' }, { status: 404 })
    }
    if (!hasFullSystemAccess(auth.role) && boat.owner_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const maintenanceType = typeMap[rawType] || rawType
    const id = generateId()
    await execute(
      `INSERT INTO boat_maintenance (id, boat_id, maintenance_type, description, cost, maintenance_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [id, boatId, maintenanceType, description, cost, scheduledDate],
    )

    const row = await queryOne(
      `SELECT m.*, b.name as boat_name FROM boat_maintenance m
       LEFT JOIN boats b ON m.boat_id = b.id WHERE m.id = ?`,
      [id],
    )
    return NextResponse.json({ success: true, data: { record: row } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/maintenance')
  }
}

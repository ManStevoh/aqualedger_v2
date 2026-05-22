import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination, buildOrderBy } from '@/lib/db'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { withApiPermission } from '@/lib/platform/api-auth'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'

interface Boat {
  id: string
  tenant_id: string
  owner_id: string
  registration_number: string
  name: string
  type: string
  length_meters: number
  capacity_kg: number
  engine_type: string
  engine_power_hp: number
  year_built: number
  status: string
  gps_enabled: boolean
  license_number: string
  license_expiry: Date
  created_at: Date
}

// GET /api/v2/boats - List all boats (with filters)
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.boats.read')
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const ownerId = searchParams.get('owner_id')
    const search = searchParams.get('search')
    
    const pagination = buildPagination(page, limit)
    const orderBy = buildOrderBy(
      searchParams.get('sort_by') || 'created_at',
      (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      ['created_at', 'name', 'registration_number', 'status']
    )
    
    let whereClause = ''
    const params: unknown[] = []
    const conditions: string[] = []

    pushTenantCondition(conditions, params, 'b', auth.tenantId)
    
    // Filter by owner for non-admin users
    if (!hasFullSystemAccess(auth.role)) {
      conditions.push('b.owner_id = ?')
      params.push(auth.userId)
    } else if (ownerId) {
      conditions.push('b.owner_id = ?')
      params.push(ownerId)
    }
    
    if (status) {
      conditions.push('b.status = ?')
      params.push(status)
    }
    
    if (search) {
      conditions.push('(b.name LIKE ? OR b.registration_number LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`
    }
    
    // Get total count
    const [countResult] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM boats b ${whereClause}`,
      params
    )
    const total = countResult?.total || 0
    
    // Get boats with owner info
    const boats = await query<Boat & { owner_name: string }>(
      `SELECT b.*, CONCAT(u.first_name, ' ', u.last_name) as owner_name
       FROM boats b
       LEFT JOIN users u ON b.owner_id = u.id
       ${whereClause}
       ${orderBy}
       ${pagination.clause}`,
      params
    )
    
    return NextResponse.json({
      success: true,
      data: {
        boats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/boats')
  }
}

// POST /api/v2/boats - Create a new boat
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.boats.write')
    const body = await request.json()
    
    const {
      registrationNumber,
      name,
      type,
      lengthMeters,
      capacityKg,
      engineType,
      enginePowerHp,
      yearBuilt,
      gpsEnabled,
      licenseNumber,
      licenseExpiry,
      insuranceNumber,
      insuranceExpiry,
      notes,
    } = body
    
    // Validate required fields
    if (!registrationNumber || !name || !type) {
      return NextResponse.json(
        { success: false, error: 'Registration number, name, and type are required' },
        { status: 400 }
      )
    }
    
    // Check for duplicate registration number within tenant
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM boats WHERE tenant_id = ? AND registration_number = ?',
      [auth.tenantId, registrationNumber]
    )
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Boat with this registration number already exists' },
        { status: 409 }
      )
    }
    
    const id = generateId()
    const ownerId = body.ownerId || auth.userId
    
    const hullType = ['fiber', 'wooden', 'steel', 'aluminum'].includes(type)
      ? type
      : 'fiber'
    const cap = capacityKg != null ? Number(capacityKg) : 500

    await query(
      `INSERT INTO boats (
        id, tenant_id, owner_id, registration_number, name, type, length_meters, capacity_kg,
        engine_type, engine_power_hp, year_built, status, gps_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        id,
        auth.tenantId,
        ownerId,
        registrationNumber,
        name,
        hullType,
        lengthMeters || null,
        cap,
        engineType || null,
        enginePowerHp || null,
        yearBuilt || null,
        gpsEnabled || false,
      ],
    )
    
    const boat = await queryOne<Boat>(
      'SELECT * FROM boats WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Boat created successfully',
      data: { boat },
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/boats')
  }
}

// PUT /api/v2/boats - Update a boat
export async function PUT(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.boats.write')
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Boat ID is required' },
        { status: 400 }
      )
    }
    
    const boat = await queryOne<Boat>(
      'SELECT * FROM boats WHERE id = ? AND tenant_id = ?',
      [id, auth.tenantId],
    )
    assertTenantMatch(boat, auth.tenantId, 'Boat')
    
    if (!hasFullSystemAccess(auth.role) && boat.owner_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Build update query
    const allowedFields = [
      'name', 'type', 'length_meters', 'capacity_kg', 'engine_type',
      'engine_power_hp', 'status', 'gps_enabled', 'license_number',
      'license_expiry', 'insurance_number', 'insurance_expiry', 'notes'
    ]
    
    const updateParts: string[] = []
    const updateParams: unknown[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      if (allowedFields.includes(snakeKey)) {
        updateParts.push(`${snakeKey} = ?`)
        updateParams.push(value)
      }
    }
    
    if (updateParts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    updateParams.push(id, auth.tenantId)
    
    await execute(
      `UPDATE boats SET ${updateParts.join(', ')} WHERE id = ? AND tenant_id = ?`,
      updateParams,
    )
    
    const updatedBoat = await queryOne<Boat>(
      'SELECT * FROM boats WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Boat updated successfully',
      data: { boat: updatedBoat },
    })
  } catch (error) {
    return handleApiError(error, 'v2/boats')
  }
}

// DELETE /api/v2/boats - Delete a boat
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.boats.write')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Boat ID is required' },
        { status: 400 }
      )
    }
    
    const boat = await queryOne<Boat>(
      'SELECT * FROM boats WHERE id = ? AND tenant_id = ?',
      [id, auth.tenantId],
    )
    assertTenantMatch(boat, auth.tenantId, 'Boat')
    
    if (!hasFullSystemAccess(auth.role) && boat.owner_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    await execute(
      `UPDATE boats SET status = 'decommissioned' WHERE id = ? AND tenant_id = ?`,
      [id, auth.tenantId],
    )
    
    return NextResponse.json({
      success: true,
      message: 'Boat deleted successfully',
    })
  } catch (error) {
    return handleApiError(error, 'v2/boats')
  }
}

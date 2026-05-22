import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination, buildOrderBy, transaction } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'

interface FishingTrip {
  id: string
  tenant_id: string
  boat_id: string
  captain_id: string
  landing_site_id: string
  departure_time: Date
  return_time: Date | null
  status: string
  fishing_zone: string
  weather_conditions: string
  sea_state: string
  fuel_used_liters: number
  fuel_cost: number
  other_expenses: number
  total_catch_kg: number
  total_revenue: number
  notes: string
  created_at: Date
}

// GET /api/v2/trips - List fishing trips
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.trips.read')
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const boatId = searchParams.get('boat_id')
    const captainId = searchParams.get('captain_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const pagination = buildPagination(page, limit)
    const orderBy = buildOrderBy(
      searchParams.get('sort_by') || 'departure_time',
      (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      ['created_at', 'departure_time', 'return_time', 'status', 'total_catch_kg']
    )
    
    const conditions: string[] = []
    const params: unknown[] = []

    pushTenantCondition(conditions, params, 't', auth.tenantId)
    
    // Filter by user's boats for non-admin
    if (!hasFullSystemAccess(auth.role) && auth.role !== 'bmu_official') {
      conditions.push('(t.captain_id = ? OR b.owner_id = ?)')
      params.push(auth.userId, auth.userId)
    }
    
    if (status) {
      conditions.push('t.status = ?')
      params.push(status)
    }
    
    if (boatId) {
      conditions.push('t.boat_id = ?')
      params.push(boatId)
    }
    
    if (captainId) {
      conditions.push('t.captain_id = ?')
      params.push(captainId)
    }
    
    if (startDate) {
      conditions.push('t.departure_time >= ?')
      params.push(startDate)
    }
    
    if (endDate) {
      conditions.push('t.departure_time <= ?')
      params.push(endDate)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const [countResult] = await query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM fishing_trips t
       LEFT JOIN boats b ON t.boat_id = b.id
       ${whereClause}`,
      params
    )
    const total = countResult?.total || 0
    
    // Get trips with related data
    const trips = await query(
      `SELECT t.*,
              b.name as boat_name,
              b.registration_number,
              CONCAT(u.first_name, ' ', u.last_name) as captain_name,
              ls.name as landing_site_name
       FROM fishing_trips t
       LEFT JOIN boats b ON t.boat_id = b.id
       LEFT JOIN users u ON t.captain_id = u.id
       LEFT JOIN landing_sites ls ON t.landing_site_id = ls.id
       ${whereClause}
       ${orderBy}
       ${pagination.clause}`,
      params
    )
    
    return NextResponse.json({
      success: true,
      data: {
        trips,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/trips')
  }
}

// POST /api/v2/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.trips.write')
    const body = await request.json()
    
    const {
      boatId,
      captainId,
      landingSiteId,
      departureTime,
      fishingZone,
      weatherConditions,
      seaState,
      notes,
    } = body
    
    // Validate required fields
    if (!boatId || !departureTime) {
      return NextResponse.json(
        { success: false, error: 'Boat ID and departure time are required' },
        { status: 400 }
      )
    }
    
    const boat = await queryOne<{ id: string; owner_id: string; tenant_id: string }>(
      'SELECT id, owner_id, tenant_id FROM boats WHERE id = ? AND tenant_id = ? AND status = "active"',
      [boatId, auth.tenantId],
    )
    assertTenantMatch(boat, auth.tenantId, 'Boat')
    
    if (!hasFullSystemAccess(auth.role) && boat.owner_id !== auth.userId) {
      // Check if user is assigned crew
      const crewAssignment = await queryOne(
        'SELECT id FROM boat_crew WHERE boat_id = ? AND crew_member_id = ? AND status = "active"',
        [boatId, auth.userId],
      )
      
      if (!crewAssignment) {
        return NextResponse.json(
          { success: false, error: 'You are not authorized to create trips for this boat' },
          { status: 403 }
        )
      }
    }
    
    const id = generateId()
    const captain = captainId || auth.userId
    
    await query(
      `INSERT INTO fishing_trips (
        id, tenant_id, boat_id, captain_id, landing_site_id, departure_time,
        status, fishing_zone, weather_conditions, sea_state, notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'ongoing', ?, ?, ?, ?)`,
      [
        id, auth.tenantId, boatId, captain, landingSiteId || null, departureTime,
        fishingZone || null, weatherConditions || null, seaState || null, notes || null
      ]
    )
    
    const trip = await queryOne<FishingTrip>(
      'SELECT * FROM fishing_trips WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Trip started successfully',
      data: { trip },
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/trips')
  }
}

// PUT /api/v2/trips - Update/complete a trip
export async function PUT(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.trips.write')
    const body = await request.json()
    const { id, action, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      )
    }
    
    // Get trip and verify access
    const trip = await queryOne<FishingTrip & { owner_id: string }>(
      `SELECT t.*, b.owner_id
       FROM fishing_trips t
       LEFT JOIN boats b ON t.boat_id = b.id
       WHERE t.id = ? AND t.tenant_id = ?`,
      [id, auth.tenantId],
    )
    
    assertTenantMatch(trip, auth.tenantId, 'Trip')
    
    if (!hasFullSystemAccess(auth.role) && trip.owner_id !== auth.userId && trip.captain_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Handle trip completion
    if (action === 'complete') {
      const { returnTime, fuelUsedLiters, fuelCost, otherExpenses } = updates
      
      await execute(
        `UPDATE fishing_trips SET
          status = 'completed',
          return_time = ?,
          fuel_used_liters = ?,
          fuel_cost = ?
        WHERE id = ? AND tenant_id = ?`,
        [returnTime || new Date().toISOString(), fuelUsedLiters || 0, fuelCost || 0, id, auth.tenantId],
      )
      
      // Calculate total catch and revenue from catches table
      await execute(
        `UPDATE fishing_trips t SET
          total_catch_kg = (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches WHERE trip_id = ?),
          total_revenue = (SELECT COALESCE(SUM(total_value), 0) FROM catches WHERE trip_id = ?)
        WHERE id = ? AND tenant_id = ?`,
        [id, id, id, auth.tenantId]
      )
    } else if (action === 'cancel') {
      await execute(
        `UPDATE fishing_trips SET status = 'cancelled' WHERE id = ? AND tenant_id = ?`,
        [id, auth.tenantId]
      )
    } else {
      // Regular update
      const allowedFields = [
        'fishing_zone', 'weather_conditions', 'sea_state', 'notes',
        'fuel_used_liters', 'fuel_cost', 'other_expenses'
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
      
      if (updateParts.length > 0) {
        updateParams.push(id)
        updateParams.push(auth.tenantId)
        await execute(
          `UPDATE fishing_trips SET ${updateParts.join(', ')} WHERE id = ? AND tenant_id = ?`,
          updateParams
        )
      }
    }
    
    const updatedTrip = await queryOne<FishingTrip>(
      'SELECT * FROM fishing_trips WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: action === 'complete' ? 'Trip completed successfully' : 'Trip updated successfully',
      data: { trip: updatedTrip },
    })
  } catch (error) {
    return handleApiError(error, 'v2/trips')
  }
}

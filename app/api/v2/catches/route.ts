import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination, buildOrderBy } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'
import { createTraceabilityLot } from '@/lib/modules/inventory/service'

interface Catch {
  id: string
  tenant_id: string
  trip_id: string
  species_id: string
  quantity_kg: number
  grade: string
  unit_price: number
  total_value: number
  storage_method: string
  recorded_by: string
  recorded_at: Date
  notes: string
}

// GET /api/v2/catches - List catches
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.catches.read')
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tripId = searchParams.get('trip_id')
    const speciesId = searchParams.get('species_id')
    const grade = searchParams.get('grade')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const pagination = buildPagination(page, limit)
    const orderBy = buildOrderBy(
      searchParams.get('sort_by') || 'created_at',
      (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      ['created_at', 'quantity_kg', 'total_value', 'grade']
    )
    
    const conditions: string[] = []
    const params: unknown[] = []

    pushTenantCondition(conditions, params, 'c', auth.tenantId)
    
    // Filter by user's access
    if (!hasFullSystemAccess(auth.role) && auth.role !== 'bmu_official') {
      conditions.push('(t.captain_id = ? OR b.owner_id = ?)')
      params.push(auth.userId, auth.userId)
    }
    
    if (tripId) {
      conditions.push('c.trip_id = ?')
      params.push(tripId)
    }
    
    if (speciesId) {
      conditions.push('c.species_id = ?')
      params.push(speciesId)
    }
    
    if (grade) {
      conditions.push('c.grade = ?')
      params.push(grade)
    }
    
    if (startDate) {
      conditions.push('c.created_at >= ?')
      params.push(startDate)
    }

    if (endDate) {
      conditions.push('c.created_at <= ?')
      params.push(endDate)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const [countResult] = await query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM catches c
       LEFT JOIN fishing_trips t ON c.trip_id = t.id
       LEFT JOIN boats b ON t.boat_id = b.id
       ${whereClause}`,
      params
    )
    const total = countResult?.total || 0
    
    // Get catches with related data
    const catches = await query(
      `SELECT c.*,
              fs.name as species_name,
              t.departure_time as trip_date,
              b.name as boat_name,
              CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
       FROM catches c
       LEFT JOIN fish_species fs ON c.species_id = fs.id
       LEFT JOIN fishing_trips t ON c.trip_id = t.id
       LEFT JOIN boats b ON t.boat_id = b.id
       LEFT JOIN users u ON c.recorded_by = u.id
       ${whereClause}
       ${orderBy}
       ${pagination.clause}`,
      params
    )
    
    // Get summary statistics
    const [summary] = await query<{ 
      total_kg: number
      total_value: number
      avg_price: number
    }>(
      `SELECT 
        COALESCE(SUM(c.quantity_kg), 0) as total_kg,
        COALESCE(SUM(c.total_value), 0) as total_value,
        COALESCE(AVG(c.unit_price), 0) as avg_price
       FROM catches c
       LEFT JOIN fishing_trips t ON c.trip_id = t.id
       LEFT JOIN boats b ON t.boat_id = b.id
       ${whereClause}`,
      params
    )
    
    return NextResponse.json({
      success: true,
      data: {
        catches,
        summary: summary || { total_kg: 0, total_value: 0, avg_price: 0 },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/catches')
  }
}

// POST /api/v2/catches - Record a catch
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.catches.write')
    const body = await request.json()
    
    const {
      tripId,
      speciesId,
      quantityKg: qtyRaw,
      grade,
      unitPrice: priceRaw,
      storageMethod,
      notes,
      fishType,
      mscCertified,
    } = body

    const quantityKg = qtyRaw ?? body.weight
    const unitPrice = priceRaw ?? body.pricePerKg

    let resolvedSpeciesId: string | undefined = speciesId
    if (!resolvedSpeciesId && typeof fishType === 'string' && fishType.trim()) {
      const sp = await queryOne<{ id: string }>(
        'SELECT id FROM fish_species WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [fishType.trim()],
      )
      resolvedSpeciesId = sp?.id
    }

    // Validate required fields
    if (!tripId || !resolvedSpeciesId || quantityKg == null || unitPrice == null) {
      return NextResponse.json(
        { success: false, error: 'Trip ID, species (or fish type name), quantity, and unit price are required' },
        { status: 400 }
      )
    }
    
    // Verify trip exists and is in progress
    const trip = await queryOne<{ id: string; status: string; captain_id: string; owner_id: string; tenant_id: string }>(
      `SELECT t.id, t.status, t.captain_id, t.tenant_id, b.owner_id
       FROM fishing_trips t
       LEFT JOIN boats b ON t.boat_id = b.id
       WHERE t.id = ? AND t.tenant_id = ?`,
      [tripId, auth.tenantId],
    )
    assertTenantMatch(trip, auth.tenantId, 'Trip')
    
    if (trip.status !== 'ongoing' && trip.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot record catch for this trip' },
        { status: 400 }
      )
    }
    
    // Verify access
    if (!hasFullSystemAccess(auth.role) && auth.role !== 'bmu_official' &&
        trip.owner_id !== auth.userId && trip.captain_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Verify species exists
    const species = await queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM fish_species WHERE id = ?',
      [resolvedSpeciesId]
    )
    
    if (!species) {
      return NextResponse.json(
        { success: false, error: 'Fish species not found' },
        { status: 404 }
      )
    }
    
    const id = generateId()
    const totalValue = parseFloat(String(quantityKg)) * parseFloat(String(unitPrice))

    const rawGrade = typeof grade === 'string' ? grade : 'B'
    const gradeMap: Record<string, string> = { premium: 'A', export: 'B', local: 'C' }
    const dbGrade =
      ['A', 'B', 'C', 'reject'].includes(rawGrade) ? rawGrade : gradeMap[rawGrade] || 'B'

    await query(
      `INSERT INTO catches (
        id, tenant_id, trip_id, species_id, quantity_kg, grade, unit_price,
        total_value, storage_method, recorded_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, auth.tenantId, tripId, resolvedSpeciesId, quantityKg, dbGrade, unitPrice,
        totalValue, storageMethod || 'iced', auth.userId, notes || null
      ]
    )
    
    // Update trip totals
    await execute(
      `UPDATE fishing_trips SET
        total_catch_kg = (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches WHERE trip_id = ?),
        total_revenue = (SELECT COALESCE(SUM(total_value), 0) FROM catches WHERE trip_id = ?)
      WHERE id = ?`,
      [tripId, tripId, tripId]
    )
    
    const catchRecord = await queryOne<Catch>(
      'SELECT * FROM catches WHERE id = ?',
      [id]
    )

    if (mscCertified) {
      const tripMeta = await queryOne<{
        vessel_name: string | null
        landing_site_name: string | null
      }>(
        `SELECT b.name as vessel_name, ls.name as landing_site_name
         FROM fishing_trips t
         JOIN boats b ON t.boat_id = b.id
         LEFT JOIN landing_sites ls ON t.landing_site_id = ls.id
         WHERE t.id = ?`,
        [tripId],
      )
      await createTraceabilityLot(auth.tenantId, {
        catchId: id,
        speciesName: species.name,
        vesselName: tripMeta?.vessel_name ?? undefined,
        landingSite: tripMeta?.landing_site_name ?? undefined,
        grading: dbGrade as 'A' | 'B' | 'C',
        mscCertified: true,
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Catch recorded successfully',
      data: { catch: catchRecord },
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/catches')
  }
}

// PUT /api/v2/catches - Update a catch record
export async function PUT(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.catches.write')
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Catch ID is required' },
        { status: 400 }
      )
    }
    
    // Get catch and verify access
    const catchRecord = await queryOne<Catch & { captain_id: string; owner_id: string }>(
      `SELECT c.*, t.captain_id, b.owner_id
       FROM catches c
       LEFT JOIN fishing_trips t ON c.trip_id = t.id
       LEFT JOIN boats b ON t.boat_id = b.id
       WHERE c.id = ? AND c.tenant_id = ?`,
      [id, auth.tenantId],
    )
    
    assertTenantMatch(catchRecord, auth.tenantId, 'Catch')
    
    if (!hasFullSystemAccess(auth.role) && auth.role !== 'bmu_official' &&
        catchRecord.owner_id !== auth.userId && catchRecord.captain_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const allowedFields = ['quantity_kg', 'grade', 'unit_price', 'storage_method', 'notes']
    const updateParts: string[] = []
    const updateParams: unknown[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      if (allowedFields.includes(snakeKey)) {
        updateParts.push(`${snakeKey} = ?`)
        updateParams.push(value)
      }
    }
    
    // Recalculate total value if quantity or price changed
    if (updates.quantityKg || updates.unitPrice) {
      const newQty = updates.quantityKg || catchRecord.quantity_kg
      const newPrice = updates.unitPrice || catchRecord.unit_price
      updateParts.push('total_value = ?')
      updateParams.push(parseFloat(newQty) * parseFloat(newPrice))
    }
    
    if (updateParts.length > 0) {
      updateParams.push(id, auth.tenantId)
      await execute(
        `UPDATE catches SET ${updateParts.join(', ')} WHERE id = ? AND tenant_id = ?`,
        updateParams,
      )
      
      await execute(
        `UPDATE fishing_trips SET
          total_catch_kg = (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches WHERE trip_id = ? AND tenant_id = ?),
          total_revenue = (SELECT COALESCE(SUM(total_value), 0) FROM catches WHERE trip_id = ? AND tenant_id = ?)
        WHERE id = ? AND tenant_id = ?`,
        [catchRecord.trip_id, auth.tenantId, catchRecord.trip_id, auth.tenantId, catchRecord.trip_id, auth.tenantId],
      )
    }
    
    const updatedCatch = await queryOne<Catch>(
      'SELECT * FROM catches WHERE id = ?',
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Catch record updated successfully',
      data: { catch: updatedCatch },
    })
  } catch (error) {
    return handleApiError(error, 'v2/catches')
  }
}

// DELETE /api/v2/catches - Delete a catch record
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withApiPermission('fishing.catches.write')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Catch ID is required' },
        { status: 400 }
      )
    }
    
    // Get catch and verify access
    const catchRecord = await queryOne<Catch & { captain_id: string; owner_id: string; trip_id: string }>(
      `SELECT c.*, t.captain_id, b.owner_id
       FROM catches c
       LEFT JOIN fishing_trips t ON c.trip_id = t.id
       LEFT JOIN boats b ON t.boat_id = b.id
       WHERE c.id = ? AND c.tenant_id = ?`,
      [id, auth.tenantId],
    )
    
    assertTenantMatch(catchRecord, auth.tenantId, 'Catch')
    
    if (!hasFullSystemAccess(auth.role) &&
        catchRecord.owner_id !== auth.userId && catchRecord.captain_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const tripId = catchRecord.trip_id
    
    await execute('DELETE FROM catches WHERE id = ? AND tenant_id = ?', [id, auth.tenantId])
    
    await execute(
      `UPDATE fishing_trips SET
        total_catch_kg = (SELECT COALESCE(SUM(quantity_kg), 0) FROM catches WHERE trip_id = ? AND tenant_id = ?),
        total_revenue = (SELECT COALESCE(SUM(total_value), 0) FROM catches WHERE trip_id = ? AND tenant_id = ?)
      WHERE id = ? AND tenant_id = ?`,
      [tripId, auth.tenantId, tripId, auth.tenantId, tripId, auth.tenantId],
    )
    
    return NextResponse.json({
      success: true,
      message: 'Catch record deleted successfully',
    })
  } catch (error) {
    return handleApiError(error, 'v2/catches')
  }
}

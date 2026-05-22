import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination, buildOrderBy } from '@/lib/db'
import { withApiPermission } from '@/lib/platform/api-auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { assertTenantMatch, pushTenantCondition } from '@/lib/tenant-scope'

// GET /api/v2/marketplace - List marketplace listings
export async function GET(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.listings.read')
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'available'
    const speciesId = searchParams.get('species_id')
    const grade = searchParams.get('grade')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const landingSiteId = searchParams.get('landing_site_id')
    const search = searchParams.get('search')
    
    const pagination = buildPagination(page, limit)
    const orderBy = buildOrderBy(
      searchParams.get('sort_by') || 'created_at',
      (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      ['created_at', 'price_per_kg', 'quantity_kg', 'available_quantity_kg']
    )
    
    const conditions: string[] = []
    const params: unknown[] = []
    pushTenantCondition(conditions, params, 'fl', auth.tenantId)

    if (status && status !== 'all') {
      conditions.push('fl.status = ?')
      params.push(status)
    }
    
    if (speciesId) {
      conditions.push('fl.species_id = ?')
      params.push(speciesId)
    }
    
    if (grade) {
      conditions.push('fl.grade = ?')
      params.push(grade)
    }
    
    if (minPrice) {
      conditions.push('fl.price_per_kg >= ?')
      params.push(parseFloat(minPrice))
    }
    
    if (maxPrice) {
      conditions.push('fl.price_per_kg <= ?')
      params.push(parseFloat(maxPrice))
    }
    
    if (landingSiteId) {
      conditions.push('fl.landing_site_id = ?')
      params.push(landingSiteId)
    }
    
    if (search) {
      conditions.push('(fl.fish_type LIKE ? OR fs.name LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    
    // Exclude expired listings
    conditions.push('(fl.expires_at IS NULL OR fl.expires_at > NOW())')
    
    const whereClause = `WHERE ${conditions.join(' AND ')}`
    
    // Get total count
    const [countResult] = await query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM fish_listings fl
       LEFT JOIN fish_species fs ON fl.species_id = fs.id
       ${whereClause}`,
      params
    )
    const total = countResult?.total || 0
    
    // Get listings
    const listings = await query(
      `SELECT fl.*,
              fs.name as species_name,
              CONCAT(u.first_name, ' ', u.last_name) as seller_name,
              u.phone as seller_phone,
              ls.name as landing_site_name,
              ls.county as landing_site_county
       FROM fish_listings fl
       LEFT JOIN fish_species fs ON fl.species_id = fs.id
       LEFT JOIN users u ON fl.seller_id = u.id
       LEFT JOIN landing_sites ls ON fl.landing_site_id = ls.id
       ${whereClause}
       ${orderBy}
       ${pagination.clause}`,
      params
    )
    
    // Get market statistics
    const [stats] = await query<{
      total_listings: number
      total_available_kg: number
      avg_price: number
    }>(
      `SELECT 
        COUNT(*) as total_listings,
        COALESCE(SUM(available_quantity_kg), 0) as total_available_kg,
        COALESCE(AVG(price_per_kg), 0) as avg_price
       FROM fish_listings fl
       WHERE fl.status = 'available'
       AND fl.tenant_id = ?
       AND (fl.expires_at IS NULL OR fl.expires_at > NOW())`,
      [auth.tenantId],
    )
    
    return NextResponse.json({
      success: true,
      data: {
        listings,
        stats: stats || { total_listings: 0, total_available_kg: 0, avg_price: 0 },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/marketplace')
  }
}

// POST /api/v2/marketplace - Create a listing
export async function POST(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.listings.write')
    const body = await request.json()
    
    const {
      speciesId: speciesIdRaw,
      fishType,
      quantityKg,
      grade,
      pricePerKg,
      location,
      landingSiteId,
      storageMethod,
      description,
      expiresInHours,
      photos,
    } = body

    let speciesId = speciesIdRaw as string | undefined
    if (!speciesId && typeof fishType === 'string' && fishType.trim()) {
      const sp = await queryOne<{ id: string }>(
        'SELECT id FROM fish_species WHERE LOWER(name) = LOWER(?) AND (tenant_id IS NULL OR tenant_id = ?) LIMIT 1',
        [fishType.trim(), auth.tenantId],
      )
      speciesId = sp?.id
    }

    // Validate required fields
    if (!speciesId || !fishType || !quantityKg || !pricePerKg) {
      return NextResponse.json(
        { success: false, error: 'Species (or resolvable fish type), fish type label, quantity, and price are required' },
        { status: 400 }
      )
    }

    // Verify species exists
    const species = await queryOne<{ id: string }>(
      'SELECT id FROM fish_species WHERE id = ? AND (tenant_id IS NULL OR tenant_id = ?)',
      [speciesId, auth.tenantId],
    )

    if (!species) {
      return NextResponse.json(
        { success: false, error: 'Fish species not found' },
        { status: 404 }
      )
    }
    
    const id = generateId()
    const expiresAt = expiresInHours 
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : null
    
    const g = typeof grade === 'string' ? grade : 'B'
    const gradeMap: Record<string, string> = { premium: 'A', export: 'B', local: 'C' }
    const dbGrade = ['A', 'B', 'C'].includes(g) ? g : gradeMap[g] || 'B'

    await query(
      `INSERT INTO fish_listings (
        id, tenant_id, seller_id, species_id, fish_type, quantity_kg, available_quantity_kg,
        grade, price_per_kg, location, landing_site_id, storage_method,
        description, expires_at, photos, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        id, auth.tenantId, auth.userId, speciesId, fishType, quantityKg, quantityKg,
        dbGrade, pricePerKg, location || null, landingSiteId || null,
        storageMethod || 'iced', description || null, expiresAt,
        photos ? JSON.stringify(photos) : null
      ]
    )
    
    const listing = await queryOne(
      `SELECT fl.*, fs.name as species_name
       FROM fish_listings fl
       LEFT JOIN fish_species fs ON fl.species_id = fs.id
       WHERE fl.id = ?`,
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Listing created successfully',
      data: { listing },
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/marketplace')
  }
}

// PUT /api/v2/marketplace - Update a listing
export async function PUT(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.listings.write')
    const body = await request.json()
    const { id, action, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }
    
    // Get listing and verify ownership
    const listing = await queryOne<{ id: string; seller_id: string; status: string; tenant_id: string }>(
      'SELECT id, seller_id, status, tenant_id FROM fish_listings WHERE id = ?',
      [id]
    )
    assertTenantMatch(listing, auth.tenantId, 'Listing')

    if (!hasFullSystemAccess(auth.role) && listing.seller_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Handle specific actions
    if (action === 'cancel') {
      await execute(
        `UPDATE fish_listings SET status = 'cancelled' WHERE id = ?`,
        [id]
      )
    } else if (action === 'reserve') {
      if (listing.status !== 'available') {
        return NextResponse.json(
          { success: false, error: 'Listing is not available' },
          { status: 400 }
        )
      }
      await execute(
        `UPDATE fish_listings SET status = 'reserved' WHERE id = ?`,
        [id]
      )
    } else {
      // Regular update
      const allowedFields = [
        'price_per_kg', 'available_quantity_kg', 'grade', 
        'storage_method', 'description', 'location'
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
        await execute(
          `UPDATE fish_listings SET ${updateParts.join(', ')} WHERE id = ?`,
          updateParams
        )
      }
    }
    
    const updatedListing = await queryOne(
      `SELECT fl.*, fs.name as species_name
       FROM fish_listings fl
       LEFT JOIN fish_species fs ON fl.species_id = fs.id
       WHERE fl.id = ?`,
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing: updatedListing },
    })
  } catch (error) {
    return handleApiError(error, 'v2/marketplace')
  }
}

// DELETE /api/v2/marketplace - Delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withApiPermission('commerce.listings.write')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }
    
    const listing = await queryOne<{ id: string; seller_id: string; tenant_id: string }>(
      'SELECT id, seller_id, tenant_id FROM fish_listings WHERE id = ?',
      [id]
    )
    assertTenantMatch(listing, auth.tenantId, 'Listing')

    if (!hasFullSystemAccess(auth.role) && listing.seller_id !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    await execute('DELETE FROM fish_listings WHERE id = ? AND tenant_id = ?', [id, auth.tenantId])
    
    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    return handleApiError(error, 'v2/marketplace')
  }
}

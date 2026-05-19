import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const boatId = searchParams.get('boatId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const pagination = buildPagination(page, limit)

    const conditions: string[] = []
    const params: unknown[] = []

    if (!hasFullSystemAccess(auth.role)) {
      conditions.push('e.user_id = ?')
      params.push(auth.userId)
    }

    if (category) {
      conditions.push('e.category = ?')
      params.push(category)
    }
    if (status) {
      conditions.push('e.status = ?')
      params.push(status)
    }
    if (boatId) {
      conditions.push('e.boat_id = ?')
      params.push(boatId)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM expenses e ${where}`,
      params
    )
    const total = countRow?.total || 0

    const expenses = await query(
      `SELECT e.*, b.name as boat_name
       FROM expenses e
       LEFT JOIN boats b ON e.boat_id = b.id
       ${where}
       ORDER BY e.expense_date DESC, e.created_at DESC
       ${pagination.clause}`,
      params
    )

    const [sumRow] = await query<{ total: number }>(
      `SELECT COALESCE(SUM(amount),0) as total FROM expenses e ${where}`,
      params
    )

    const byCategory = await query<{ category: string; total: number }>(
      `SELECT e.category, COALESCE(SUM(e.amount),0) as total
       FROM expenses e ${where}
       GROUP BY e.category`,
      params
    )

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        totalAmount: sumRow?.total || 0,
        byCategory: Object.fromEntries(byCategory.map((r) => [r.category, Number(r.total)])),
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/expenses')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const body = await request.json()
    let category = body.category as string
    const description = body.description as string
    const amount = Number(body.amount)
    const boatId = body.boatId as string | undefined
    const tripId = body.tripId as string | undefined
    const expenseDate = (body.date as string) || new Date().toISOString().split('T')[0]

    if (!description || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Description and amount required' }, { status: 400 })
    }

    const map: Record<string, string> = {
      wages: 'crew_wages',
      labor: 'crew_wages',
      fuel: 'fuel',
      maintenance: 'maintenance',
      insurance: 'insurance',
      licenses: 'licenses',
      storage: 'storage',
      transport: 'transport',
      equipment: 'equipment',
      other: 'other',
    }
    category = map[category] || category
    const allowed = ['fuel', 'maintenance', 'crew_wages', 'equipment', 'licenses', 'insurance', 'storage', 'transport', 'other']
    if (!allowed.includes(category)) {
      category = 'other'
    }

    const id = generateId()
    await execute(
      `INSERT INTO expenses (id, user_id, boat_id, trip_id, category, description, amount, expense_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, auth.userId, boatId || null, tripId || null, category, description, amount, expenseDate]
    )

    const row = await queryOne('SELECT * FROM expenses WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: { expense: row } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/expenses')
  }
}

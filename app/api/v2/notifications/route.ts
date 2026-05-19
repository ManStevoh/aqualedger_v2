import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, execute, generateId, buildPagination } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100)
    const pagination = buildPagination(page, limit)

    const conditions = ['n.user_id = ?']
    const params: unknown[] = [auth.userId]
    if (unreadOnly) {
      conditions.push('n.is_read = FALSE')
    }
    const where = `WHERE ${conditions.join(' AND ')}`

    const [countRow] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM notifications n ${where}`,
      params
    )
    const total = countRow?.total || 0

    const [unreadRow] = await query<{ c: number }>(
      `SELECT COUNT(*) as c FROM notifications n WHERE n.user_id = ? AND n.is_read = FALSE`,
      [auth.userId]
    )

    const items = await query(
      `SELECT * FROM notifications n ${where}
       ORDER BY n.created_at DESC
       ${pagination.clause}`,
      params
    )

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        unreadCount: unreadRow?.c || 0,
      },
    })
  } catch (error) {
    return handleApiError(error, 'v2/notifications')
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['super_admin', 'investor', 'bmu_official'])
    const body = await request.json()
    const { userId, title, message, type, link } = body
    if (!userId || !title || !message) {
      return NextResponse.json({ success: false, error: 'userId, title, message required' }, { status: 400 })
    }
    const id = generateId()
    await execute(
      `INSERT INTO notifications (id, user_id, type, title, message, action_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, type || 'info', title, message, link || null]
    )
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/notifications')
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const body = await request.json()
    const { id, markAllRead } = body

    if (markAllRead) {
      await execute(`UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE`, [
        auth.userId,
      ])
      return NextResponse.json({ success: true })
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    }

    await execute(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, auth.userId]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'v2/notifications')
  }
}

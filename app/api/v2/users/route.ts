import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-handler'
import { query, queryOne, execute, generateId } from '@/lib/db'
import {
  requireAuth,
  requireRole,
  hashPassword,
  verifyPassword,
  validatePassword,
  type UserRole,
} from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['super_admin', 'investor'])
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const offset = (page - 1) * limit

    const [countRow] = await query<{ total: number }>('SELECT COUNT(*) as total FROM users', [])
    const total = countRow?.total || 0

    const users = await query(
      `SELECT id, email, first_name, last_name, phone, role, status, avatar_url, created_at, last_login
       FROM users
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
    )

    return NextResponse.json({
      success: true,
      data: { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } },
    })
  } catch (error) {
    return handleApiError(error, 'v2/users')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const body = await request.json()
    const targetId = (body.userId as string) || (body.id as string) || auth.userId

    if (targetId !== auth.userId && !hasFullSystemAccess(auth.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const creds = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = ?',
      [targetId],
    )
    if (!creds) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const newPassword = body.password as string | undefined
    const currentPassword = body.currentPassword as string | undefined
    const isAdminResettingOtherUser = hasFullSystemAccess(auth.role) && targetId !== auth.userId

    if (newPassword) {
      if (!isAdminResettingOtherUser) {
        if (!currentPassword || typeof currentPassword !== 'string') {
          return NextResponse.json(
            { success: false, error: 'Current password is required' },
            { status: 400 },
          )
        }
        const match = await verifyPassword(currentPassword, creds.password_hash)
        if (!match) {
          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 },
          )
        }
      }
      const strength = validatePassword(newPassword)
      if (!strength.valid) {
        return NextResponse.json(
          { success: false, error: strength.message || 'Invalid password' },
          { status: 400 },
        )
      }
    }

    const firstName = body.firstName as string | undefined
    const lastName = body.lastName as string | undefined
    const phone = body.phone as string | undefined
    const county = body.county as string | undefined
    const notifPrefs = body.notificationPreferences as Record<string, unknown> | undefined

    const sets: string[] = []
    const params: unknown[] = []
    if (firstName != null) {
      sets.push('first_name = ?')
      params.push(firstName)
    }
    if (lastName != null) {
      sets.push('last_name = ?')
      params.push(lastName)
    }
    if (phone !== undefined) {
      sets.push('phone = ?')
      params.push(phone || null)
    }
    if (county !== undefined) {
      sets.push('county = ?')
      params.push(county || null)
    }

    if (
      notifPrefs != null &&
      typeof notifPrefs === 'object' &&
      !Array.isArray(notifPrefs) &&
      targetId === auth.userId
    ) {
      sets.push('notification_preferences = ?')
      params.push(JSON.stringify(notifPrefs))
    }

    if (newPassword) {
      sets.push('password_hash = ?')
      params.push(await hashPassword(newPassword))
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    params.push(targetId)
    await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params)

    return NextResponse.json({ success: true, message: 'User updated' })
  } catch (error) {
    return handleApiError(error, 'v2/users')
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['super_admin', 'investor'])
    const body = await request.json()
    const email = (body.email as string)?.trim().toLowerCase()
    const password = body.password as string
    const firstName = (body.firstName as string)?.trim()
    const lastName = (body.lastName as string)?.trim()
    const phone = (body.phone as string)?.trim() || null
    const role = (body.role as UserRole) || 'fisherman'

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, first and last name are required' },
        { status: 400 },
      )
    }

    const hash = await hashPassword(password)
    const id = generateId()

    await execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [id, email, hash, firstName, lastName, phone, role],
    )

    await execute(
      `INSERT INTO wallets (id, user_id, balance, currency, status) VALUES (?, ?, 0, 'KES', 'active')`,
      [generateId(), id],
    )
    await execute(
      `INSERT INTO credit_scores (id, user_id, score, grade) VALUES (?, ?, 300, 'E')`,
      [generateId(), id],
    )

    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'v2/users')
  }
}

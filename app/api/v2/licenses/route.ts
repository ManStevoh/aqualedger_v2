import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { licenseCreateSchema } from '@/lib/validation/schemas'
import { apiHandler, handleApiError } from '@/lib/api-handler'
import { logAudit } from '@/lib/audit'

export const GET = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const status = searchParams.get('status')
  const licenseType = searchParams.get('type')
  const userId = searchParams.get('userId')

  const pagination = buildPagination(page, limit)
  const conditions: string[] = []
  const params: unknown[] = []

  if (!hasFullSystemAccess(auth.role)) {
    conditions.push('l.user_id = ?')
    params.push(auth.userId)
  } else if (userId) {
    conditions.push('l.user_id = ?')
    params.push(userId)
  }

  if (status) {
    conditions.push('l.status = ?')
    params.push(status)
  }
  if (licenseType) {
    conditions.push('l.license_type = ?')
    params.push(licenseType)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM licenses l ${where}`,
    params,
  )
  const total = countRow?.total || 0

  const licenses = await query(
    `SELECT l.*, CONCAT(u.first_name, ' ', u.last_name) as holder_name, u.email as holder_email
     FROM licenses l
     JOIN users u ON l.user_id = u.id
     ${where}
     ORDER BY l.expires_date ASC
     ${pagination.clause}`,
    params,
  )

  const summary = await queryOne<{
    total: number
    active: number
    expired: number
    suspended: number
  }>(
    `SELECT
       COUNT(*) as total,
       SUM(status = 'active') as active,
       SUM(status = 'expired') as expired,
       SUM(status = 'suspended') as suspended
     FROM licenses l ${where}`,
    params,
  )

  return NextResponse.json({
    success: true,
    data: {
      licenses,
      summary: summary || { total: 0, active: 0, expired: 0, suspended: 0 },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  })
}, 'v2/licenses')

export const POST = apiHandler(async (request: NextRequest) => {
  const auth = await requireRole(['super_admin', 'investor', 'bmu_official'])
  const body = licenseCreateSchema.parse(await request.json())

  const licenseNumber =
    body.licenseNumber ||
    `${body.licenseType.slice(0, 2).toUpperCase()}L-${Date.now().toString(36).toUpperCase()}`

  const id = generateId()
  const issuedDate = body.issuedDate || new Date().toISOString().split('T')[0]

  await execute(
    `INSERT INTO licenses (id, user_id, license_type, license_number, issued_date, expires_date, issuing_authority, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      id,
      body.userId,
      body.licenseType,
      licenseNumber,
      issuedDate,
      body.expiresDate,
      body.issuingAuthority || 'BMU',
    ],
  )

  await logAudit({
    userId: auth.userId,
    action: 'license.issue',
    resourceType: 'license',
    resourceId: id,
    metadata: { licenseNumber, holderId: body.userId },
  })

  const license = await queryOne('SELECT * FROM licenses WHERE id = ?', [id])
  return NextResponse.json(
    { success: true, message: 'License issued', data: { license } },
    { status: 201 },
  )
}, 'v2/licenses')

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireRole(['super_admin', 'investor', 'bmu_official'])
    const body = await request.json()
    const { licenseId, action, reason } = body as {
      licenseId: string
      action: 'suspend' | 'revoke' | 'renew'
      reason?: string
    }

    if (!licenseId || !action) {
      return NextResponse.json(
        { success: false, error: 'licenseId and action are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    if (action === 'renew') {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      await execute(
        `UPDATE licenses SET status = 'active', expires_date = ?, updated_at = NOW() WHERE id = ?`,
        [expires.toISOString().split('T')[0], licenseId],
      )
      await logAudit({
        userId: auth.userId,
        action: 'license.issue',
        resourceType: 'license',
        resourceId: licenseId,
        metadata: { action: 'renew' },
      })
    } else if (action === 'suspend') {
      await execute(`UPDATE licenses SET status = 'suspended' WHERE id = ?`, [licenseId])
      await logAudit({
        userId: auth.userId,
        action: 'license.suspend',
        resourceType: 'license',
        resourceId: licenseId,
        metadata: { reason },
      })
    } else if (action === 'revoke') {
      await execute(`UPDATE licenses SET status = 'revoked' WHERE id = ?`, [licenseId])
      await logAudit({
        userId: auth.userId,
        action: 'license.revoke',
        resourceType: 'license',
        resourceId: licenseId,
        metadata: { reason },
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    const license = await queryOne('SELECT * FROM licenses WHERE id = ?', [licenseId])
    return NextResponse.json({ success: true, data: { license } })
  } catch (error) {
    return handleApiError(error, 'v2/licenses')
  }
}

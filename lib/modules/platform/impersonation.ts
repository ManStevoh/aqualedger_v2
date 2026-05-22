import { cookies } from 'next/headers'
import {
  createSession,
  getUserById,
  refreshSession,
  setAuthCookies,
  setAdminRefreshCookie,
  getAdminRefreshToken,
  clearAuthCookies,
  type UserRole,
} from '@/lib/auth'
import { forbidden, ApiError } from '@/lib/api-handler'
import { logAudit } from '@/lib/audit'
import { queryOne } from '@/lib/db'

const BLOCKED_ROLES: UserRole[] = ['super_admin']

export async function startImpersonation(
  adminUserId: string,
  targetUserId: string,
  opts?: { ipAddress?: string; userAgent?: string },
): Promise<{ targetEmail: string; targetRole: UserRole }> {
  if (adminUserId === targetUserId) {
    throw new ApiError('Cannot impersonate yourself', 400, 'BAD_REQUEST')
  }

  const target = await getUserById(targetUserId)
  if (!target || target.status !== 'active') {
    throw new ApiError('Target user not found or inactive', 404, 'NOT_FOUND')
  }
  if (BLOCKED_ROLES.includes(target.role)) {
    throw forbidden('Cannot impersonate platform administrators')
  }

  const cookieStore = await cookies()
  const adminRefresh = cookieStore.get('refresh_token')?.value
  if (!adminRefresh) {
    throw new ApiError('Admin session missing refresh token', 401, 'UNAUTHORIZED')
  }

  const adminSession = await queryOne<{ expires_at: Date }>(
    `SELECT expires_at FROM sessions WHERE refresh_token = ? AND user_id = ? AND expires_at > NOW() LIMIT 1`,
    [adminRefresh, adminUserId],
  )
  if (!adminSession) {
    throw new ApiError('Admin session expired; sign in again', 401, 'UNAUTHORIZED')
  }

  const tenantRow = await queryOne<{ tenant_id: string }>(
    `SELECT tenant_id FROM tenant_members WHERE user_id = ? AND status = 'active' ORDER BY joined_at ASC LIMIT 1`,
    [targetUserId],
  )

  const session = await createSession(
    targetUserId,
    opts?.ipAddress,
    opts?.userAgent,
    false,
    adminUserId,
  )

  await setAdminRefreshCookie(adminRefresh, adminSession.expires_at)
  await setAuthCookies(session.accessToken, session.refreshToken, session.expiresAt)

  await logAudit({
    userId: adminUserId,
    tenantId: tenantRow?.tenant_id ?? null,
    action: 'platform.impersonate.start',
    resourceType: 'user',
    resourceId: targetUserId,
    metadata: { targetEmail: target.email, targetRole: target.role },
    ipAddress: opts?.ipAddress ?? null,
    userAgent: opts?.userAgent ?? null,
  })

  return { targetEmail: target.email, targetRole: target.role }
}

export async function endImpersonation(
  adminUserId: string,
  opts?: { ipAddress?: string; userAgent?: string },
): Promise<{ email: string }> {
  const adminRefresh = await getAdminRefreshToken()
  if (!adminRefresh) {
    throw new ApiError('No impersonation session to end', 400, 'BAD_REQUEST')
  }

  const restored = await refreshSession(adminRefresh)
  if (!restored) {
    await clearAuthCookies()
    throw new ApiError('Admin session expired; sign in again', 401, 'UNAUTHORIZED')
  }

  const admin = await getUserById(adminUserId)
  if (!admin) {
    await clearAuthCookies()
    throw new ApiError('Admin user not found', 401, 'UNAUTHORIZED')
  }

  await setAuthCookies(restored.accessToken, restored.refreshToken, restored.expiresAt)

  await logAudit({
    userId: adminUserId,
    action: 'platform.impersonate.end',
    resourceType: 'user',
    resourceId: adminUserId,
    ipAddress: opts?.ipAddress ?? null,
    userAgent: opts?.userAgent ?? null,
  })

  return { email: admin.email }
}

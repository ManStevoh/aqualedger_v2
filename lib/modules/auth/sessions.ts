import { query, execute } from '@/lib/db'

export interface UserSession {
  id: string
  user_id: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export async function listUserSessions(userId: string): Promise<UserSession[]> {
  return query<UserSession>(
    `SELECT id, user_id, expires_at, ip_address, user_agent, created_at
     FROM sessions WHERE user_id = ? AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId],
  )
}

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const result = await execute(`DELETE FROM sessions WHERE id = ? AND user_id = ?`, [
    sessionId,
    userId,
  ])
  return result.affectedRows > 0
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
  if (exceptSessionId) {
    const result = await execute(`DELETE FROM sessions WHERE user_id = ? AND id != ?`, [
      userId,
      exceptSessionId,
    ])
    return result.affectedRows
  }
  const result = await execute(`DELETE FROM sessions WHERE user_id = ?`, [userId])
  return result.affectedRows
}

export async function recordLoginAlert(input: {
  userId: string
  tenantId?: string
  ipAddress?: string
  userAgent?: string
  isNewDevice?: boolean
}): Promise<void> {
  const { generateId } = await import('@/lib/db')
  await execute(
    `INSERT INTO login_alerts (id, user_id, tenant_id, ip_address, user_agent, is_new_device)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      generateId(),
      input.userId,
      input.tenantId || null,
      input.ipAddress || null,
      input.userAgent || null,
      input.isNewDevice ? 1 : 0,
    ],
  )
}

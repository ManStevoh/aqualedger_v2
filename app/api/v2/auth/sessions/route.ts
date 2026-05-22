import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { queryOne } from '@/lib/db'
import {
  listUserSessions,
  revokeSession,
  revokeAllSessions,
} from '@/lib/modules/auth/sessions'

async function getCurrentSessionId(userId: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (!refreshToken) return undefined
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM sessions WHERE user_id = ? AND refresh_token = ? AND expires_at > NOW() LIMIT 1`,
    [userId, refreshToken],
  )
  return row?.id
}

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('auth.sessions.read')
  const sessions = await listUserSessions(ctx.userId)
  const currentSessionId = await getCurrentSessionId(ctx.userId)
  return jsonOk({ sessions, currentSessionId })
}, 'v2/auth/sessions')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('auth.sessions.write')
  const { searchParams } = new URL(request.url)
  const revokeAll = searchParams.get('all') === 'true'
  const id = searchParams.get('id')

  if (revokeAll) {
    const exceptId = (await getCurrentSessionId(ctx.userId)) || undefined
    const count = await revokeAllSessions(ctx.userId, exceptId)
    return jsonOk({ revokedCount: count, keptCurrent: Boolean(exceptId) })
  }

  if (!id) throw new Error('Session id is required (or use ?all=true)')
  const revoked = await revokeSession(id, ctx.userId)
  return jsonOk({ revoked })
}, 'v2/auth/sessions')

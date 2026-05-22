import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface NotificationRow {
  id: string
  tenant_id: string
  user_id: string
  type: string
  title: string
  message: string
  action_url: string | null
  is_read: number
  read_at: string | null
  created_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  tenant_id: string
  channel_email: number
  channel_sms: number
  channel_push: number
  channel_whatsapp: number
  digest: 'instant' | 'daily' | 'weekly'
}

export interface UpsertPreferencesInput {
  channelEmail?: boolean
  channelSms?: boolean
  channelPush?: boolean
  channelWhatsapp?: boolean
  digest?: 'instant' | 'daily' | 'weekly'
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'id' | 'user_id' | 'tenant_id'> = {
  channel_email: 1,
  channel_sms: 0,
  channel_push: 1,
  channel_whatsapp: 0,
  digest: 'instant',
}

export async function listNotifications(
  tenantId: string,
  userId: string,
  opts: { unreadOnly?: boolean; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 30, 100)
  const pagination = buildPagination(page, limit)
  const conditions = ['n.user_id = ?', tenantWhere('n')]
  const params: unknown[] = [userId, tenantId]

  if (opts.unreadOnly) {
    conditions.push('n.is_read = FALSE')
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM notifications n ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const unreadConditions = ['n.user_id = ?', 'n.is_read = FALSE', tenantWhere('n')]
  const [unreadRow] = await query<{ c: number }>(
    `SELECT COUNT(*) as c FROM notifications n WHERE ${unreadConditions.join(' AND ')}`,
    [userId, tenantId],
  )

  const items = await query<NotificationRow>(
    `SELECT * FROM notifications n ${where}
     ORDER BY n.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return {
    items,
    unreadCount: unreadRow?.c ?? 0,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function markNotificationRead(
  tenantId: string,
  userId: string,
  notificationId: string,
): Promise<void> {
  await execute(
    `UPDATE notifications SET is_read = TRUE, read_at = NOW()
     WHERE id = ? AND user_id = ? AND ${tenantWhere()}`,
    [notificationId, userId, tenantId],
  )
}

export async function markAllNotificationsRead(
  tenantId: string,
  userId: string,
): Promise<void> {
  await execute(
    `UPDATE notifications SET is_read = TRUE, read_at = NOW()
     WHERE user_id = ? AND ${tenantWhere()} AND is_read = FALSE`,
    [userId, tenantId],
  )
}

export async function getNotificationPreferences(
  tenantId: string,
  userId: string,
): Promise<NotificationPreferences> {
  const row = await queryOne<NotificationPreferences>(
    `SELECT * FROM notification_preferences WHERE user_id = ? AND ${tenantWhere()}`,
    [userId, tenantId],
  )
  if (row) {
    return row
  }

  const id = generateId()
  await execute(
    `INSERT INTO notification_preferences
     (id, user_id, tenant_id, channel_email, channel_sms, channel_push, channel_whatsapp, digest)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      tenantId,
      DEFAULT_PREFERENCES.channel_email,
      DEFAULT_PREFERENCES.channel_sms,
      DEFAULT_PREFERENCES.channel_push,
      DEFAULT_PREFERENCES.channel_whatsapp,
      DEFAULT_PREFERENCES.digest,
    ],
  )

  const created = await queryOne<NotificationPreferences>(
    `SELECT * FROM notification_preferences WHERE id = ?`,
    [id],
  )
  if (!created) {
    throw new Error('Failed to initialize notification preferences')
  }
  return created
}

export async function upsertNotificationPreferences(
  tenantId: string,
  userId: string,
  input: UpsertPreferencesInput,
): Promise<NotificationPreferences> {
  const existing = await getNotificationPreferences(tenantId, userId)

  const fields: string[] = []
  const params: unknown[] = []

  if (input.channelEmail !== undefined) {
    fields.push('channel_email = ?')
    params.push(input.channelEmail ? 1 : 0)
  }
  if (input.channelSms !== undefined) {
    fields.push('channel_sms = ?')
    params.push(input.channelSms ? 1 : 0)
  }
  if (input.channelPush !== undefined) {
    fields.push('channel_push = ?')
    params.push(input.channelPush ? 1 : 0)
  }
  if (input.channelWhatsapp !== undefined) {
    fields.push('channel_whatsapp = ?')
    params.push(input.channelWhatsapp ? 1 : 0)
  }
  if (input.digest !== undefined) {
    fields.push('digest = ?')
    params.push(input.digest)
  }

  if (fields.length > 0) {
    params.push(existing.id)
    await execute(
      `UPDATE notification_preferences SET ${fields.join(', ')} WHERE id = ?`,
      params,
    )
  }

  return getNotificationPreferences(tenantId, userId)
}

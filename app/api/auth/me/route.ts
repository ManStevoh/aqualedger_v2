import { NextResponse } from 'next/server'
import { requireAuth, getUserById } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getTenantMemberRole } from '@/lib/platform/access'
import { getTenantRolePermissions } from '@/lib/platform/tenant-role-permissions'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import type { TenantMemberRole } from '@/lib/tenant'

function parseNotificationPreferences(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw) as unknown
      if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

export async function GET() {
  try {
    const auth = await requireAuth()
    const user = await getUserById(auth.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    let notificationPreferences: Record<string, unknown> | null = null
    try {
      const prefRow = await queryOne<{ notification_preferences: unknown }>(
        'SELECT notification_preferences FROM users WHERE id = ?',
        [user.id],
      )
      notificationPreferences = parseNotificationPreferences(prefRow?.notification_preferences)
    } catch {
      notificationPreferences = null
    }

    let impersonation: { adminUserId: string; adminEmail?: string } | null = null
    if (auth.impersonatedBy) {
      const admin = await getUserById(auth.impersonatedBy)
      impersonation = {
        adminUserId: auth.impersonatedBy,
        adminEmail: admin?.email,
      }
    }

    let tenantId: string | null = null
    let tenantSlug: string | null = null
    let memberRole: TenantMemberRole | null = null
    let permissions: string[] | null = null
    try {
      tenantId = await resolveUserTenantId(user.id)
      if (tenantId) {
        const tenant = await queryOne<{ slug: string }>('SELECT slug FROM tenants WHERE id = ?', [tenantId])
        tenantSlug = tenant?.slug ?? null
      }
      memberRole = await getTenantMemberRole(user.id, tenantId, user.role)
      const perms = await getTenantRolePermissions(tenantId, memberRole)
      permissions = perms
    } catch {
      /* non-blocking */
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          county: user.county,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatar_url,
          createdAt:
            user.created_at instanceof Date ? user.created_at.toISOString() : String(user.created_at),
          notificationPreferences,
        },
        impersonation,
        tenantId,
        tenantSlug,
        memberRole,
        permissions,
      },
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('auth/me GET', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ success: false, error: 'Failed to load session' }, { status: 500 })
  }
}

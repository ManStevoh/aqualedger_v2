import { queryOne, execute } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export interface DashboardWidget {
  id: string
  type: string
  position: number
  visible: boolean
}

export interface UserDashboardLayout {
  user_id: string
  tenant_id: string
  widgets: DashboardWidget[]
  updated_at: string
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'kpis', type: 'kpi_strip', position: 0, visible: true },
  { id: 'quick_actions', type: 'quick_actions', position: 1, visible: true },
  { id: 'notifications', type: 'notifications', position: 2, visible: true },
  { id: 'modules', type: 'module_grid', position: 3, visible: true },
]

function parseWidgets(raw: string | DashboardWidget[]): DashboardWidget[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw) as DashboardWidget[]
    return parsed.length > 0 ? parsed : DEFAULT_WIDGETS
  } catch {
    return DEFAULT_WIDGETS
  }
}

export async function getUserDashboardLayout(
  tenantId: string,
  userId: string,
): Promise<UserDashboardLayout> {
  const row = await queryOne<{
    user_id: string
    tenant_id: string
    widgets: string | DashboardWidget[]
    updated_at: string
  }>(
    `SELECT * FROM user_dashboard_layout WHERE user_id = ? AND ${tenantWhere()}`,
    [userId, tenantId],
  )

  if (!row) {
    return {
      user_id: userId,
      tenant_id: tenantId,
      widgets: DEFAULT_WIDGETS,
      updated_at: new Date().toISOString(),
    }
  }

  return {
    ...row,
    widgets: parseWidgets(row.widgets),
  }
}

export async function saveUserDashboardLayout(
  tenantId: string,
  userId: string,
  widgets: DashboardWidget[],
): Promise<UserDashboardLayout> {
  const existing = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM user_dashboard_layout WHERE user_id = ? AND ${tenantWhere()}`,
    [userId, tenantId],
  )

  if (existing) {
    await execute(
      `UPDATE user_dashboard_layout SET widgets = ?, updated_at = NOW()
       WHERE user_id = ? AND ${tenantWhere()}`,
      [JSON.stringify(widgets), userId, tenantId],
    )
  } else {
    await execute(
      `INSERT INTO user_dashboard_layout (user_id, tenant_id, widgets)
       VALUES (?, ?, ?)`,
      [userId, tenantId, JSON.stringify(widgets)],
    )
  }

  return getUserDashboardLayout(tenantId, userId)
}

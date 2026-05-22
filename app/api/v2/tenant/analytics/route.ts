import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getExecutiveSummary } from '@/lib/modules/analytics/service'
import { query } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')
  const summary = await getExecutiveSummary(ctx.tenantId)

  const [commerce] = await query<{ orders_30d: number; revenue_30d: number; avg_order: number }>(
    `SELECT
       COUNT(*) as orders_30d,
       COALESCE(SUM(total), 0) as revenue_30d,
       COALESCE(AVG(total), 0) as avg_order
     FROM orders
     WHERE ${tenantWhere()} AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [ctx.tenantId],
  )

  const [members] = await query<{ active_members: number }>(
    `SELECT COUNT(*) as active_members FROM tenant_members
     WHERE tenant_id = ? AND status = 'active'`,
    [ctx.tenantId],
  )

  const [storefront] = await query<{ published: number; theme_id: string }>(
    `SELECT published, theme_id FROM tenant_storefront_settings WHERE tenant_id = ?`,
    [ctx.tenantId],
  )

  return jsonOk({
    summary,
    commerce30d: {
      orders: commerce?.orders_30d ?? 0,
      revenue: Number(commerce?.revenue_30d ?? 0),
      averageOrderValue: Number(commerce?.avg_order ?? 0),
    },
    team: { activeMembers: members?.active_members ?? 0 },
    storefront: {
      published: Boolean(storefront?.published),
      themeId: storefront?.theme_id ?? 'ocean-classic',
    },
  })
}, 'v2/tenant/analytics')

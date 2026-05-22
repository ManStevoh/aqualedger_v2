import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { hasFullSystemAccess } from '@/lib/platform-access'
import { getSalesTracking } from '@/lib/modules/commerce/sales-tracking'
import type { TenantMemberRole } from '@/lib/tenant'

const TENANT_WIDE_SALES_ROLES: TenantMemberRole[] = [
  'tenant_owner',
  'branch_manager',
  'accountant',
]

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.orders.read')
  const { searchParams } = new URL(request.url)
  const periodDays = Number(searchParams.get('period') || 30)
  const scope = searchParams.get('scope')

  const canViewTenant =
    hasFullSystemAccess(ctx.role) || TENANT_WIDE_SALES_ROLES.includes(ctx.memberRole)

  const sellerUserId =
    scope === 'mine' || !canViewTenant ? ctx.userId : null

  const report = await getSalesTracking(ctx.tenantId, {
    periodDays: Number.isFinite(periodDays) ? periodDays : 30,
    sellerUserId,
  })

  return jsonOk({ report, canViewTenant })
}, 'v2/commerce/sales')

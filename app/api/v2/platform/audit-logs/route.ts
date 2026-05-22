import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, forbidden } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/platform/access'
import { hasPermission } from '@/lib/platform/permissions'
import { listAuditLogs } from '@/lib/modules/platform/audit-query'

export const GET = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 50)
  const page = Number(searchParams.get('page') || 1)
  const userId = searchParams.get('userId') || undefined
  const action = searchParams.get('action') || undefined

  if (
    auth.role === 'super_admin' &&
    hasPermission('tenant_owner', 'platform.audit.read', auth.role)
  ) {
    const tenantId = searchParams.get('tenantId') || undefined
    const logs = await listAuditLogs({
      platformScope: true,
      tenantId,
      userId,
      action,
      limit,
      page,
    })
    return jsonOk({ logs })
  }

  const ctx = await requirePermission('tenant.audit.read')
  if (auth.role !== 'super_admin' && !ctx.tenantId) {
    throw forbidden()
  }
  const logs = await listAuditLogs({
    tenantId: ctx.tenantId,
    userId,
    action,
    limit,
    page,
  })
  return jsonOk({ logs })
}, 'v2/platform/audit-logs')

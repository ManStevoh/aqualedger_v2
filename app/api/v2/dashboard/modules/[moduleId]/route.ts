import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { notFound, forbidden } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getModuleDashboard } from '@/lib/modules/dashboard/module-summaries'
import {
  isValidModuleDashboardId,
  permissionForModuleDashboard,
} from '@/lib/modules/dashboard/module-permissions'
import { hasPermission } from '@/lib/platform/permissions'

export const GET = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('analytics.dashboard.read')
    const { moduleId } = await (context?.params ?? Promise.resolve({ moduleId: '' }))

    if (!isValidModuleDashboardId(moduleId)) {
      throw notFound('Unknown module dashboard')
    }

    const { isModuleEnabled } = await import('@/lib/platform/module-enablement')
    if (!(await isModuleEnabled(moduleId))) {
      throw forbidden('This module is disabled on this platform')
    }

    const required = permissionForModuleDashboard(moduleId)
    if (required && !hasPermission(ctx.memberRole, required, ctx.role)) {
      throw forbidden('You do not have access to this module dashboard')
    }

    const dashboard = await getModuleDashboard(moduleId, ctx.tenantId)
    if (!dashboard) throw notFound('Module dashboard not available')

    return jsonOk({ dashboard })
  },
  'v2/dashboard/modules/[moduleId]',
)

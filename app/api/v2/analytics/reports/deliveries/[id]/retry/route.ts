import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { retryReportDelivery } from '@/lib/modules/analytics/delivery-retry'

export const POST = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('analytics.reports.deliver')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const result = await retryReportDelivery(ctx.tenantId, id)
    return jsonOk(result)
  },
  'v2/analytics/reports/deliveries/[id]/retry',
)

import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { runDueScheduledReports } from '@/lib/modules/analytics/scheduled-runner'

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('analytics.scheduled.write')
  const result = await runDueScheduledReports(ctx.tenantId)
  return jsonOk(result)
}, 'v2/analytics/reports/run-scheduled')

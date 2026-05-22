import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { runShelfLifeAlerts } from '@/lib/jobs/shelf-life-alerts'

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('inventory.batches.write')
  const result = await runShelfLifeAlerts(ctx.tenantId)
  return jsonOk(result)
}, 'v2/inventory/expiry-alerts/run')

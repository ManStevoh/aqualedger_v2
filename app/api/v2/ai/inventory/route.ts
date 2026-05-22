import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { predictInventoryReorder } from '@/lib/modules/ai/inventory-prediction'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('inventory.stock.read')
  const predictions = await predictInventoryReorder(ctx.tenantId)
  return jsonOk({ predictions })
}, 'v2/ai/inventory')

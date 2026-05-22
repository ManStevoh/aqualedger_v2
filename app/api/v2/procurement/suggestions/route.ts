import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getSmartProcurementSuggestions } from '@/lib/modules/procurement/suggestions'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('procurement.orders.read')
  const suggestions = await getSmartProcurementSuggestions(ctx.tenantId)
  return jsonOk({ suggestions })
}, 'v2/procurement/suggestions')

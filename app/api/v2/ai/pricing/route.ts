import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { computePricePredictions } from '@/lib/modules/ai/pricing'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('ai.forecast.read')
  const predictions = await computePricePredictions(ctx.tenantId)
  return jsonOk({ predictions })
}, 'v2/ai/pricing')

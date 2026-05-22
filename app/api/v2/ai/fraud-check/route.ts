import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { detectWalletFraud } from '@/lib/modules/ai/fraud-detection'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('ai.forecast.read')
  const alerts = await detectWalletFraud(ctx.tenantId)
  return jsonOk({ alerts, flagged: alerts.length })
}, 'v2/ai/fraud-check')

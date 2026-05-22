import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { reconcileStaleMpesaIntents } from '@/lib/modules/platform/mpesa-reconcile'

export const POST = apiHandler(async () => {
  await requireSuperAdmin()
  const result = await reconcileStaleMpesaIntents()
  return jsonOk(result)
}, 'v2/platform/payments/reconcile')

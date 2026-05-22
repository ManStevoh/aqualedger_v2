import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import {
  listReconcileRuns,
  runPlatformPaymentReconcile,
  getPaymentMonitorSummary,
} from '@/lib/modules/platform/payment-reconcile'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const [runs, summary] = await Promise.all([listReconcileRuns(30), getPaymentMonitorSummary()])
  return jsonOk({ runs, summary })
}, 'v2/platform/payments/reconcile')

export const POST = apiHandler(async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  if (cronSecret && headerSecret === cronSecret) {
    const result = await runPlatformPaymentReconcile('cron')
    return jsonOk(result)
  }
  await requireSuperAdmin()
  const result = await runPlatformPaymentReconcile('manual')
  return jsonOk(result)
}, 'v2/platform/payments/reconcile')

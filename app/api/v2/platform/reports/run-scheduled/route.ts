import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, unauthorized } from '@/lib/api-handler'
import { runDueScheduledReports } from '@/lib/modules/analytics/scheduled-runner'

/** Cron: run due scheduled reports for all tenants. Header x-cron-secret = CRON_SECRET */
export const POST = apiHandler(async (request: NextRequest) => {
  const expected = process.env.CRON_SECRET
  const provided = request.headers.get('x-cron-secret')
  if (!expected || !provided || provided !== expected) {
    throw unauthorized('Invalid cron secret')
  }

  const result = await runDueScheduledReports()
  return jsonOk(result)
}, 'v2/platform/reports/run-scheduled')

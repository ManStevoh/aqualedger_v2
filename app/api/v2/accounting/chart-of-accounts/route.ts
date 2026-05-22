import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  DEFAULT_CHART_OF_ACCOUNTS,
  seedDefaultChartOfAccounts,
  countGlAccounts,
} from '@/lib/modules/accounting/chart-of-accounts'

const seedSchema = z.object({
  missingOnly: z.boolean().optional().default(true),
})

export const GET = apiHandler(async () => {
  await requirePermission('accounting.ledger.read')
  return jsonOk({
    template: DEFAULT_CHART_OF_ACCOUNTS,
    accountCount: DEFAULT_CHART_OF_ACCOUNTS.length,
    description:
      'Standard fisheries / seafood chart (IFRS-style). Seeded automatically for new companies.',
  })
}, 'v2/accounting/chart-of-accounts')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = request.headers.get('content-type')?.includes('application/json')
    ? await request.json().catch(() => ({}))
    : {}
  const input = seedSchema.parse(body)

  const before = await countGlAccounts(ctx.tenantId)
  const result = await seedDefaultChartOfAccounts(ctx.tenantId, {
    missingOnly: input.missingOnly,
  })

  return jsonOk({
    ...result,
    before,
    message:
      result.created > 0
        ? `Added ${result.created} GL account(s)`
        : result.alreadyHadAccounts
          ? 'Chart already present — use missingOnly to add any new standard codes only'
          : 'No new accounts added',
  })
}, 'v2/accounting/chart-of-accounts')

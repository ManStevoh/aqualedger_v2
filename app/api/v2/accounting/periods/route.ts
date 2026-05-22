import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listFiscalPeriods,
  createFiscalPeriod,
  closeFiscalPeriod,
} from '@/lib/modules/accounting/period-close'

const createSchema = z.object({
  name: z.string().min(1).max(50),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('accounting.reports.read')
  const periods = await listFiscalPeriods(ctx.tenantId)
  return jsonOk({ periods })
}, 'v2/accounting/periods')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = createSchema.parse(await request.json())
  const period = await createFiscalPeriod(ctx.tenantId, {
    name: body.name,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
  })
  return jsonOk({ period }, 201)
}, 'v2/accounting/periods')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = z.object({ periodId: z.string(), action: z.literal('close') }).parse(await request.json())
  const period = await closeFiscalPeriod(ctx.tenantId, body.periodId, ctx.userId)
  return jsonOk({ period })
}, 'v2/accounting/periods')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listTaxReturns, createTaxReturn, fileTaxReturn } from '@/lib/modules/accounting/tax-returns'

const createSchema = z.object({
  returnType: z.enum(['vat', 'paye', 'withholding', 'corporate']),
  periodLabel: z.string().min(1),
  taxableAmount: z.number().optional(),
  taxAmount: z.number().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('accounting.reports.read')
  const returns = await listTaxReturns(ctx.tenantId)
  return jsonOk({ taxReturns: returns })
}, 'v2/accounting/tax-returns')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = createSchema.parse(await request.json())
  const taxReturn = await createTaxReturn(ctx.tenantId, body)
  return jsonOk({ taxReturn }, 201)
}, 'v2/accounting/tax-returns')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = z.object({ returnId: z.string(), action: z.literal('file') }).parse(await request.json())
  const taxReturn = await fileTaxReturn(ctx.tenantId, body.returnId)
  return jsonOk({ taxReturn })
}, 'v2/accounting/tax-returns')

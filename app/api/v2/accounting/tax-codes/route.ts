import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { taxCodeCreateSchema } from '@/lib/modules/accounting/schemas'
import { listTaxCodes, createTaxCode } from '@/lib/modules/accounting/service'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('accounting.ledger.read')
  const taxCodes = await listTaxCodes(ctx.tenantId)
  return jsonOk({ taxCodes })
}, 'v2/accounting/tax-codes')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = taxCodeCreateSchema.parse(await request.json())
  const taxCode = await createTaxCode(ctx.tenantId, body)
  return jsonOk({ taxCode }, 201)
}, 'v2/accounting/tax-codes')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listCurrencyRates, convertAmount } from '@/lib/modules/accounting/currency'

const convertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.currency.read')
  const { searchParams } = new URL(request.url)
  const base = (searchParams.get('base') || 'KES').toUpperCase()
  const rates = await listCurrencyRates(ctx.tenantId, base)
  return jsonOk({ baseCurrency: base, rates })
}, 'v2/accounting/currency')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.currency.read')
  const body = convertSchema.parse(await request.json())
  const result = await convertAmount(
    ctx.tenantId,
    body.amount,
    body.from.toUpperCase(),
    body.to.toUpperCase(),
  )
  return jsonOk({ conversion: result })
}, 'v2/accounting/currency')

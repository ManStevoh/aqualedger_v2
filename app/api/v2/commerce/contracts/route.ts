import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listSalesContracts,
  createSalesContract,
  getSalesContractSummary,
} from '@/lib/modules/commerce/sales-contracts'

const createSchema = z.object({
  buyerName: z.string().min(1).max(200),
  buyerEmail: z.string().email().optional().nullable().or(z.literal('')),
  buyerPhone: z.string().max(30).optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  speciesId: z.string().uuid().optional().nullable(),
  pricePerKg: z.number().positive(),
  contractedKg: z.number().positive(),
  currency: z.string().length(3).optional(),
  status: z.enum(['draft', 'active']).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  paymentTerms: z.string().max(120).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.contracts.read')
  const { searchParams } = new URL(request.url)
  if (searchParams.get('summary') === '1') {
    const summary = await getSalesContractSummary(ctx.tenantId)
    return jsonOk({ summary })
  }
  const data = await listSalesContracts(ctx.tenantId, {
    status: searchParams.get('status') ?? undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '50', 10),
  })
  return jsonOk(data)
}, 'v2/commerce/contracts')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.contracts.write')
  const body = createSchema.parse(await request.json())
  const contract = await createSalesContract(ctx.tenantId, {
    buyerName: body.buyerName,
    buyerEmail: body.buyerEmail,
    buyerPhone: body.buyerPhone,
    customerId: body.customerId,
    speciesId: body.speciesId,
    pricePerKg: body.pricePerKg,
    contractedKg: body.contractedKg,
    currency: body.currency,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate,
    paymentTerms: body.paymentTerms,
    notes: body.notes,
  })
  return jsonOk({ contract }, 201)
}, 'v2/commerce/contracts')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listContracts, createContract } from '@/lib/modules/hr/contracts'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  employeeId: z.string().uuid().optional(),
})

const createContractSchema = z.object({
  employeeId: z.string().uuid(),
  contractType: z.enum(['permanent', 'contract', 'casual']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  salary: z.coerce.number().min(0).optional(),
  documentUrl: z.string().max(500).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.contracts.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    employeeId: searchParams.get('employeeId') ?? undefined,
  })

  const { contracts, total } = await listContracts(ctx.tenantId, {
    employeeId: parsed.employeeId,
    page: parsed.page,
    limit: parsed.limit,
  })

  return jsonOk({
    contracts,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/contracts')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.contracts.write')
  const body = await request.json()
  const input = createContractSchema.parse(body)
  const contract = await createContract(ctx.tenantId, input)
  return jsonOk({ contract }, 201)
}, 'v2/hr/contracts')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listPayrollRuns } from '@/lib/modules/hr/service'
import { createPayrollRun } from '@/lib/modules/hr/payroll'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.payroll.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { payrollRuns, total } = await listPayrollRuns(ctx.tenantId, parsed.page, parsed.limit)

  return jsonOk({
    payrollRuns,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/payroll')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.payroll.write')
  const body = createSchema.parse(await request.json())
  const run = await createPayrollRun(ctx.tenantId, body.periodStart, body.periodEnd)
  return jsonOk({ payrollRun: run }, 201)
}, 'v2/hr/payroll')

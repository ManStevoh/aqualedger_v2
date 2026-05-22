import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listEmployees, createEmployee } from '@/lib/modules/hr/service'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createEmployeeSchema = z.object({
  employeeNumber: z.string().max(50).optional(),
  fullName: z.string().min(1).max(200),
  department: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  salary: z.coerce.number().min(0).optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['active', 'on_leave', 'terminated']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { employees, total } = await listEmployees(ctx.tenantId, parsed.page, parsed.limit)

  return jsonOk({
    employees,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/employees')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.write')
  const body = await request.json()
  const input = createEmployeeSchema.parse(body)
  const employee = await createEmployee(ctx.tenantId, input)
  return jsonOk({ employee }, 201)
}, 'v2/hr/employees')

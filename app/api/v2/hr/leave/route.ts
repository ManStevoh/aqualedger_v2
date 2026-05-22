import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
} from '@/lib/modules/hr/service'

const listQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createSchema = z.object({
  employeeId: z.string().uuid(),
  leaveType: z.enum(['annual', 'sick', 'maternity', 'unpaid', 'other']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().min(0.5).max(365),
  reason: z.string().max(2000).optional(),
})

const approveSchema = z.object({
  id: z.string().uuid(),
  approved: z.boolean(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.leave.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    employeeId: searchParams.get('employeeId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { requests, total } = await listLeaveRequests(
    ctx.tenantId,
    { employeeId: parsed.employeeId, status: parsed.status },
    parsed.page,
    parsed.limit,
  )

  return jsonOk({
    requests,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/leave')

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json()

  if (body.id !== undefined && body.approved !== undefined) {
    const ctx = await requirePermission('hr.leave.approve')
    const { id, approved } = approveSchema.parse(body)
    const request_ = await approveLeaveRequest(ctx.tenantId, id, approved)
    return jsonOk({ request: request_ })
  }

  const ctx = await requirePermission('hr.leave.write')
  const input = createSchema.parse(body)
  const request_ = await createLeaveRequest(ctx.tenantId, input)
  return jsonOk({ request: request_ }, 201)
}, 'v2/hr/leave')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listAttendance, recordAttendance } from '@/lib/modules/hr/service'

const listQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const recordSchema = z.object({
  employeeId: z.string().uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkIn: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  checkOut: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  hoursWorked: z.coerce.number().min(0).max(24).optional(),
  status: z.enum(['present', 'absent', 'late', 'half_day']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.attendance.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    employeeId: searchParams.get('employeeId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { records, total } = await listAttendance(
    ctx.tenantId,
    parsed.employeeId,
    parsed.page,
    parsed.limit,
  )

  return jsonOk({
    records,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/attendance')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.attendance.write')
  const body = await request.json()
  const input = recordSchema.parse(body)
  const record = await recordAttendance(ctx.tenantId, input)
  return jsonOk({ record }, 201)
}, 'v2/hr/attendance')

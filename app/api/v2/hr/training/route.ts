import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listTrainingRecords, createTrainingRecord } from '@/lib/modules/hr/training'

const listQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  trainingType: z.enum(['safety', 'haccp', 'equipment', 'compliance', 'other']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createSchema = z.object({
  employeeId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  trainingType: z.enum(['safety', 'haccp', 'equipment', 'compliance', 'other']).optional(),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expiryAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  certificateUrl: z.string().url().max(500).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.training.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    employeeId: searchParams.get('employeeId') ?? undefined,
    trainingType: searchParams.get('trainingType') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { records, total } = await listTrainingRecords(
    ctx.tenantId,
    { employeeId: parsed.employeeId, trainingType: parsed.trainingType },
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
}, 'v2/hr/training')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.training.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const record = await createTrainingRecord(ctx.tenantId, input)
  return jsonOk({ record }, 201)
}, 'v2/hr/training')

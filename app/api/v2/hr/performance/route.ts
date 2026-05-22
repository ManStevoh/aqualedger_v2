import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listPerformanceReviews,
  createPerformanceReview,
} from '@/lib/modules/hr/performance'

const listQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(['draft', 'submitted', 'acknowledged']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createSchema = z.object({
  employeeId: z.string().uuid(),
  reviewPeriod: z.string().min(1).max(50),
  rating: z.coerce.number().min(0).max(5),
  goals: z.string().max(5000).optional(),
  feedback: z.string().max(5000).optional(),
  status: z.enum(['draft', 'submitted', 'acknowledged']).optional(),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.performance.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    employeeId: searchParams.get('employeeId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { reviews, total } = await listPerformanceReviews(
    ctx.tenantId,
    { employeeId: parsed.employeeId, status: parsed.status },
    parsed.page,
    parsed.limit,
  )

  return jsonOk({
    reviews,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/hr/performance')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.performance.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const review = await createPerformanceReview(ctx.tenantId, input)
  return jsonOk({ review }, 201)
}, 'v2/hr/performance')

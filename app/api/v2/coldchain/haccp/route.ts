import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listHaccpChecklists, createHaccpChecklist } from '@/lib/modules/coldchain/service'

const listQuerySchema = z.object({
  facilityId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createHaccpSchema = z.object({
  facilityId: z.string().uuid().optional(),
  checklistDate: z.string().min(1),
  inspectorName: z.string().max(150).optional(),
  items: z.array(z.object({ point: z.string(), pass: z.boolean() }).passthrough()).min(1),
  overallPass: z.boolean().optional(),
  correctiveActions: z.string().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.haccp.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    facilityId: searchParams.get('facilityId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { checklists, total } = await listHaccpChecklists(ctx.tenantId, parsed)

  return jsonOk({
    checklists,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/coldchain/haccp')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('coldchain.haccp.write')
  const body = await request.json()
  const input = createHaccpSchema.parse(body)
  const checklist = await createHaccpChecklist(ctx.tenantId, input, ctx.userId)
  return jsonOk({ checklist }, 201)
}, 'v2/coldchain/haccp')

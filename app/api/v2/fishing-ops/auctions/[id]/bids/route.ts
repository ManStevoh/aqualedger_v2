import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listBids, placeBid } from '@/lib/modules/fishing-ops/auctions'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const placeBidSchema = z.object({
  bidderName: z.string().min(1).max(200),
  bidderPhone: z.string().max(30).optional(),
  bidAmount: z.coerce.number().positive(),
})

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('fishing.auctions.read')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  const { bids, total } = await listBids(ctx.tenantId, id, parsed.page, parsed.limit)

  return jsonOk({
    bids,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/fishing-ops/auctions/bids')

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('fishing.auctions.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = await request.json()
  const input = placeBidSchema.parse(body)
  const result = await placeBid(ctx.tenantId, id, input)
  return jsonOk(result, 201)
}, 'v2/fishing-ops/auctions/bids')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listFishAuctions, createFishAuction } from '@/lib/modules/fishing-ops/service'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(['scheduled', 'live', 'closed', 'cancelled']).optional(),
})

const createAuctionSchema = z.object({
  landingSiteId: z.string().uuid().optional(),
  lotCode: z.string().max(80).optional(),
  speciesName: z.string().min(1).max(150),
  quantityKg: z.coerce.number().positive(),
  startingPrice: z.coerce.number().nonnegative(),
  auctionDate: z.string().min(1),
  status: z.enum(['scheduled', 'live', 'closed', 'cancelled']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.auctions.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const { auctions, total } = await listFishAuctions(
    ctx.tenantId,
    parsed.page,
    parsed.limit,
    parsed.status,
  )

  return jsonOk({
    auctions,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/fishing-ops/auctions')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.auctions.write')
  const body = await request.json()
  const input = createAuctionSchema.parse(body)
  const auction = await createFishAuction(ctx.tenantId, input)
  return jsonOk({ auction }, 201)
}, 'v2/fishing-ops/auctions')

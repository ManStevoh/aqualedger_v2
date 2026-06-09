import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  marketplaceReviewCreateSchema,
  marketplaceReviewListQuerySchema,
} from '@/lib/modules/commerce/schemas'
import {
  listMarketplaceReviews,
  createMarketplaceReview,
} from '@/lib/modules/commerce/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.reviews.read')
  const { searchParams } = new URL(request.url)
  const query = marketplaceReviewListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    listingId: searchParams.get('listingId') ?? undefined,
  })

  const sellerId = ctx.memberRole === 'vendor' ? ctx.userId : undefined
  const data = await listMarketplaceReviews(ctx.tenantId, { ...query, sellerId })
  return jsonOk(data)
}, 'v2/commerce/reviews')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.reviews.write')
  const body = marketplaceReviewCreateSchema.parse(await request.json())
  const review = await createMarketplaceReview(ctx.tenantId, ctx.userId, body)
  return jsonOk({ review }, 201)
}, 'v2/commerce/reviews')

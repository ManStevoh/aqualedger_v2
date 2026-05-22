import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { couponCreateSchema, couponListQuerySchema } from '@/lib/modules/commerce/schemas'
import { listCoupons, createCoupon } from '@/lib/modules/commerce/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.coupons.read')
  const { searchParams } = new URL(request.url)
  const query = couponListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listCoupons(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/coupons')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.coupons.write')
  const body = couponCreateSchema.parse(await request.json())
  const coupon = await createCoupon(ctx.tenantId, body)
  return jsonOk({ coupon }, 201)
}, 'v2/commerce/coupons')

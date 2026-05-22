import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listGuestCarts,
  markAbandonedGuestCarts,
  recoverAbandonedCarts,
} from '@/lib/modules/commerce/abandoned-cart'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.storefront.read')
  const status = new URL(request.url).searchParams.get('status') || undefined
  const carts = await listGuestCarts(ctx.tenantId, { status, limit: 100 })
  return jsonOk({ carts })
}, 'v2/commerce/abandoned-carts')

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('commerce.storefront.write')
  const abandoned = await markAbandonedGuestCarts(24)
  const recovery = await recoverAbandonedCarts(ctx.tenantId)
  return jsonOk({ abandoned, recovery })
}, 'v2/commerce/abandoned-carts')

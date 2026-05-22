import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { markAbandonedGuestCarts, recoverAbandonedCarts } from '@/lib/modules/commerce/abandoned-cart'

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('commerce.storefront.write')
  const abandoned = await markAbandonedGuestCarts(24)
  const recovery = await recoverAbandonedCarts(ctx.tenantId)
  return jsonOk({ abandoned, recovery })
}, 'v2/commerce/abandoned-carts')

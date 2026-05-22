import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, ApiError } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { cartAddItemSchema, cartRemoveItemSchema } from '@/lib/modules/commerce/schemas'
import { listCart, addItem, removeItem } from '@/lib/modules/commerce/cart'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('commerce.cart.read')
  const data = await listCart(ctx.tenantId, ctx.userId)
  return jsonOk(data)
}, 'v2/commerce/cart')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.cart.write')
  const body = cartAddItemSchema.parse(await request.json())
  const data = await addItem(ctx.tenantId, ctx.userId, body)
  return jsonOk(data)
}, 'v2/commerce/cart')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.cart.write')
  const { searchParams } = new URL(request.url)
  const queryItemId = searchParams.get('itemId')
  let itemId = queryItemId

  if (!itemId) {
    const raw = await request.json().catch(() => null)
    if (raw) {
      itemId = cartRemoveItemSchema.parse(raw).itemId
    }
  }

  if (!itemId) {
    throw new ApiError('itemId is required')
  }

  const data = await removeItem(ctx.tenantId, ctx.userId, itemId)
  return jsonOk(data)
}, 'v2/commerce/cart')

import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { wishlistAddSchema, wishlistRemoveSchema } from '@/lib/modules/commerce/schemas'
import { listWishlist, addToWishlist, removeFromWishlist } from '@/lib/modules/commerce/wishlist'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('commerce.wishlist.read')
  const items = await listWishlist(ctx.tenantId, ctx.userId)
  return jsonOk({ items })
}, 'v2/commerce/wishlist')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.wishlist.write')
  const body = wishlistAddSchema.parse(await request.json())
  const item = await addToWishlist(ctx.tenantId, ctx.userId, body.listingId)
  return jsonOk({ item }, 201)
}, 'v2/commerce/wishlist')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.wishlist.write')
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listingId')
  const id = searchParams.get('id')
  const body = listingId || id
    ? { listingId: listingId ?? undefined, id: id ?? undefined }
    : wishlistRemoveSchema.parse(await request.json().catch(() => ({})))
  await removeFromWishlist(ctx.tenantId, ctx.userId, body)
  return jsonOk({ removed: true })
}, 'v2/commerce/wishlist')

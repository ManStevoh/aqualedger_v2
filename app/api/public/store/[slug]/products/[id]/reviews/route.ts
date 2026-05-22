import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { getPublicProductById } from '@/lib/modules/commerce/storefront-catalog'
import { listStorefrontProductReviews } from '@/lib/modules/commerce/storefront-reviews'

export const GET = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug, id } = await (context?.params ?? Promise.resolve({ slug: '', id: '' }))
  if (!slug || !id) throw notFound('Product not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  try {
    await getPublicProductById(tenantId, id)
  } catch {
    throw notFound('Product not found')
  }

  const data = await listStorefrontProductReviews(tenantId, id)
  return jsonOk(data)
}, 'public/store/product-reviews')

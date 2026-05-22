import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { searchPublicProducts } from '@/lib/modules/commerce/storefront-catalog'

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const { searchParams } = new URL(request.url)
  const result = await searchPublicProducts(tenantId, {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    limit: Number(searchParams.get('limit') || 48),
  })

  return jsonOk(result)
}, 'public/store/products')

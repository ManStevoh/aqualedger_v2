import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  productCatalogCreateSchema,
  productCatalogListQuerySchema,
  productCatalogUpdateSchema,
} from '@/lib/modules/commerce/schemas'
import {
  listProductCatalog,
  createProductCatalog,
  updateProductCatalog,
} from '@/lib/modules/commerce/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.catalog.read')
  const { searchParams } = new URL(request.url)
  const query = productCatalogListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    sku: searchParams.get('sku') ?? undefined,
  })

  const data = await listProductCatalog(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/commerce/products')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.catalog.write')
  const body = await request.json()
  if (body.id) {
    const parsed = productCatalogUpdateSchema.parse(body)
    const product = await updateProductCatalog(ctx.tenantId, parsed)
    return jsonOk({ product })
  }
  const parsed = productCatalogCreateSchema.parse(body)
  const product = await createProductCatalog(ctx.tenantId, parsed)
  return jsonOk({ product }, 201)
}, 'v2/commerce/products')

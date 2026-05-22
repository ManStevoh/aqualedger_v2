import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { z } from 'zod'
import {
  productVariantCreateSchema,
  productVariantUpdateSchema,
} from '@/lib/modules/commerce/schemas'
import {
  listProductVariants,
  createProductVariant,
  updateProductVariant,
} from '@/lib/modules/commerce/service'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(['active', 'inactive']).optional(),
})

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('commerce.catalog.read')
  const { id: productId } = await (context?.params ?? Promise.resolve({ id: '' }))
  const { searchParams } = new URL(request.url)
  const query = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listProductVariants(ctx.tenantId, productId, query)
  return jsonOk(data)
}, 'v2/commerce/products/[id]/variants')

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('commerce.catalog.write')
  const { id: productId } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = await request.json()
  if (body.id) {
    const parsed = productVariantUpdateSchema.parse(body)
    const variant = await updateProductVariant(ctx.tenantId, productId, parsed)
    return jsonOk({ variant })
  }
  const parsed = productVariantCreateSchema.parse(body)
  const variant = await createProductVariant(ctx.tenantId, productId, parsed)
  return jsonOk({ variant }, 201)
}, 'v2/commerce/products/[id]/variants')

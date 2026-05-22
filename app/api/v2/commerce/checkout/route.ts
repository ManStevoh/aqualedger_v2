import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { checkoutSchema } from '@/lib/modules/commerce/schemas'
import { checkout } from '@/lib/modules/commerce/checkout'

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.checkout.write')
  const body = checkoutSchema.parse(await request.json())
  const result = await checkout(ctx.tenantId, ctx.userId, body)
  return jsonOk({ checkout: result }, 201)
}, 'v2/commerce/checkout')

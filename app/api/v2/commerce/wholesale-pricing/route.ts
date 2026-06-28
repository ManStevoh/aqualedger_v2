import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listWholesaleTiers, upsertWholesaleTier, resolveUnitPrice } from '@/lib/modules/commerce/wholesale-pricing'
import { execute } from '@/lib/db'

const upsertSchema = z.object({
  productId: z.string().uuid(),
  customerSegment: z.enum(['retail', 'wholesale', 'export', 'restaurant', 'cooperative']),
  minQuantityKg: z.number().min(0),
  unitPrice: z.number().positive(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.catalog.read')
  const productId = new URL(request.url).searchParams.get('productId') || undefined
  const qty = Number(new URL(request.url).searchParams.get('quantityKg') || 0)
  const segment = new URL(request.url).searchParams.get('segment') || 'retail'

  if (productId && qty > 0) {
    const price = await resolveUnitPrice(ctx.tenantId, productId, qty, segment)
    return jsonOk({ unitPrice: price, productId, quantityKg: qty, segment })
  }

  const tiers = await listWholesaleTiers(ctx.tenantId, productId)
  return jsonOk({ tiers })
}, 'v2/commerce/wholesale-pricing')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.catalog.write')
  const body = upsertSchema.parse(await request.json())
  const id = await upsertWholesaleTier(ctx.tenantId, body)
  return jsonOk({ id }, 201)
}, 'v2/commerce/wholesale-pricing')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.catalog.write')
  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ success: false, error: 'Tier ID is required' }, { status: 400 })
  }
  await execute(
    `DELETE FROM wholesale_price_tiers WHERE id = ? AND tenant_id = ?`,
    [id, ctx.tenantId],
  )
  return jsonOk({ success: true, message: 'Pricing tier deleted successfully' })
}, 'v2/commerce/wholesale-pricing')

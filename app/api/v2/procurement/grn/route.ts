import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  goodsReceiptCreateSchema,
  goodsReceiptListQuerySchema,
} from '@/lib/modules/procurement/schemas'
import { listGoodsReceipts, createGoodsReceipt } from '@/lib/modules/procurement/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.read')
  const { searchParams } = new URL(request.url)
  const query = goodsReceiptListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    purchaseOrderId: searchParams.get('purchaseOrderId') ?? undefined,
  })

  const data = await listGoodsReceipts(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/procurement/grn')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.grn.write')
  const body = goodsReceiptCreateSchema.parse(await request.json())
  const receipt = await createGoodsReceipt(ctx.tenantId, body, ctx.userId)
  return jsonOk({ receipt }, 201)
}, 'v2/procurement/grn')

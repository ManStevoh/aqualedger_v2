import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  purchaseOrderCreateSchema,
  purchaseOrderListQuerySchema,
} from '@/lib/modules/procurement/schemas'
import { listPurchaseOrders, createPurchaseOrder } from '@/lib/modules/procurement/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.read')
  const { searchParams } = new URL(request.url)
  const query = purchaseOrderListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    supplierId: searchParams.get('supplierId') ?? undefined,
  })

  const data = await listPurchaseOrders(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/procurement/orders')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.write')
  const body = purchaseOrderCreateSchema.parse(await request.json())
  const order = await createPurchaseOrder(ctx.tenantId, body, ctx.userId)
  return jsonOk({ order }, 201)
}, 'v2/procurement/orders')

import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  purchaseRequestCreateSchema,
  purchaseRequestListQuerySchema,
} from '@/lib/modules/procurement/schemas'
import {
  listPurchaseRequests,
  createPurchaseRequest,
} from '@/lib/modules/procurement/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.read')
  const { searchParams } = new URL(request.url)
  const query = purchaseRequestListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listPurchaseRequests(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/procurement/requests')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.write')
  const body = purchaseRequestCreateSchema.parse(await request.json())
  const purchaseRequest = await createPurchaseRequest(ctx.tenantId, body, ctx.userId)
  return jsonOk({ purchaseRequest }, 201)
}, 'v2/procurement/requests')

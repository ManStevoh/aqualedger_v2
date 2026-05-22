import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { rfqCreateSchema, rfqListQuerySchema } from '@/lib/modules/procurement/schemas'
import { listRfqs, createRfq } from '@/lib/modules/procurement/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.read')
  const { searchParams } = new URL(request.url)
  const query = rfqListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listRfqs(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/procurement/rfqs')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.write')
  const body = rfqCreateSchema.parse(await request.json())
  const rfq = await createRfq(ctx.tenantId, body)
  return jsonOk({ rfq }, 201)
}, 'v2/procurement/rfqs')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createOrderReturn, listOrderReturns, updateReturnStatus } from '@/lib/modules/commerce/returns'

const createSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum(['spoiled', 'wrong_item', 'quality', 'late_delivery', 'other']),
  reasonDetail: z.string().optional(),
  refundAmount: z.number().optional(),
})

const patchSchema = z.object({
  returnId: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'refunded', 'closed']),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('commerce.orders.read')
  const returns = await listOrderReturns(ctx.tenantId)
  return jsonOk({ returns })
}, 'v2/commerce/returns')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.orders.write')
  const body = createSchema.parse(await request.json())
  const result = await createOrderReturn(ctx.tenantId, ctx.userId, body)
  return jsonOk({ return: result }, 201)
}, 'v2/commerce/returns')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.orders.write')
  const body = patchSchema.parse(await request.json())
  await updateReturnStatus(ctx.tenantId, body.returnId, body.status)
  return jsonOk({ updated: true })
}, 'v2/commerce/returns')

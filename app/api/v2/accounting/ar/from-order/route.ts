import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createArInvoiceFromOrder } from '@/lib/modules/accounting/invoices-from-order'

const bodySchema = z.object({
  orderId: z.string().uuid(),
  postToGl: z.boolean().optional().default(false),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = bodySchema.parse(await request.json())
  const result = await createArInvoiceFromOrder(ctx.tenantId, body.orderId, {
    postToGl: body.postToGl,
    userId: ctx.userId,
  })
  return jsonOk(result, 201)
}, 'v2/accounting/ar/from-order')

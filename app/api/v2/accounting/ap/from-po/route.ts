import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createApInvoiceFromPurchaseOrder } from '@/lib/modules/accounting/invoices-from-po'

const bodySchema = z.object({
  purchaseOrderId: z.string().uuid(),
  invoiceNumber: z.string().max(50).optional(),
  postToGl: z.boolean().optional().default(false),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = bodySchema.parse(await request.json())
  const result = await createApInvoiceFromPurchaseOrder(ctx.tenantId, body.purchaseOrderId, {
    invoiceNumber: body.invoiceNumber,
    postToGl: body.postToGl,
    userId: ctx.userId,
  })
  return jsonOk(result, 201)
}, 'v2/accounting/ap/from-po')

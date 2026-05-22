import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { initiateMpesaPaymentForOrder } from '@/lib/modules/payments/order-mpesa'

const bodySchema = z.object({
  phone_number: z.string().min(9).max(15),
})

export const POST = apiHandler(async (request: NextRequest, context) => {
  const ctx = await requirePermission('commerce.checkout.write')
  const params = await context?.params
  const orderId = params?.id as string
  const body = bodySchema.parse(await request.json())
  const result = await initiateMpesaPaymentForOrder(
    ctx.tenantId,
    orderId,
    body.phone_number,
    ctx.userId,
  )
  return jsonOk(result, 201)
}, 'v2/orders/[id]/pay/mpesa')

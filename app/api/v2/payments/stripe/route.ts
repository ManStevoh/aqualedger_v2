import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createStripePaymentIntent } from '@/lib/modules/integrations/stripe'

const bodySchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  order_id: z.string().optional(),
  customer_email: z.string().email().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = bodySchema.parse(await request.json())

  const result = await createStripePaymentIntent({
    tenantId: ctx.tenantId,
    amount: body.amount,
    currency: body.currency,
    orderId: body.order_id,
    customerEmail: body.customer_email,
  })

  return jsonOk(result, 201)
}, 'v2/payments/stripe')

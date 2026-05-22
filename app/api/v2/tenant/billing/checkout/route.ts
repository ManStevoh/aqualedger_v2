import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createStripeSubscriptionCheckout } from '@/lib/modules/integrations/stripe-billing'

const bodySchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = bodySchema.parse(await request.json())
  const origin = request.nextUrl.origin
  const successUrl = body.successUrl ?? `${origin}/dashboard/organization/billing?checkout=success`
  const cancelUrl = body.cancelUrl ?? `${origin}/dashboard/organization/billing?checkout=cancel`

  const session = await createStripeSubscriptionCheckout(
    ctx.tenantId,
    body.plan,
    successUrl,
    cancelUrl,
  )
  return jsonOk(session)
}, 'v2/tenant/billing/checkout')

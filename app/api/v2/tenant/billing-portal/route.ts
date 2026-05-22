import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { createStripeBillingPortalSession } from '@/lib/modules/integrations/stripe-billing'

const bodySchema = z.object({
  returnUrl: z.string().url().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.read')
  const body = bodySchema.parse(await request.json().catch(() => ({})))
  const origin = request.nextUrl.origin
  const returnUrl = body.returnUrl ?? `${origin}/dashboard/organization/billing`

  const session = await createStripeBillingPortalSession(ctx.tenantId, returnUrl)
  return jsonOk({ url: session.url, stub: session.stub })
}, 'v2/tenant/billing-portal')

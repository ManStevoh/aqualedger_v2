import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { paymentIntentCreateSchema } from '@/lib/modules/payments/schemas'
import { createPaymentIntent, listPaymentIntents } from '@/lib/modules/payments/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.wallet.read')
  const { searchParams } = new URL(request.url)
  const intents = await listPaymentIntents(ctx.tenantId, {
    status: searchParams.get('status') ?? undefined,
    provider: searchParams.get('provider') ?? undefined,
    limit: Number(searchParams.get('limit')) || 50,
  })
  return jsonOk({ intents })
}, 'v2/payments/intents')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.wallet.write')
  const body = paymentIntentCreateSchema.parse(await request.json())
  const intent = await createPaymentIntent(ctx.tenantId, body)
  return jsonOk({ intent }, 201)
}, 'v2/payments/intents')

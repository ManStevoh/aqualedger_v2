import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { queryOne } from '@/lib/db'
import { initiateStkPush, mpesaConfigured } from '@/lib/modules/integrations/mpesa'
import { simulateMpesaStkSuccess } from '@/lib/modules/integrations/mpesa-callback'
import { tenantWhere } from '@/lib/tenant'

const bodySchema = z.object({
  amount: z.number().positive(),
  phone_number: z.string().min(9).max(15),
  order_id: z.string().optional(),
  description: z.string().max(200).optional(),
  purpose: z.enum(['wallet_deposit', 'order_checkout', 'test']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const id = new URL(request.url).searchParams.get('id')
  if (!id) throw notFound('Payment intent id required')

  const row = await queryOne<{
    id: string
    status: string
    amount: number
    external_ref: string | null
    metadata: string | Record<string, unknown> | null
    updated_at: string
  }>(
    `SELECT id, status, amount, external_ref, metadata, updated_at
     FROM payment_intents WHERE id = ? AND ${tenantWhere()}`,
    [id, ctx.tenantId],
  )
  if (!row) throw notFound('Payment intent not found')
  return jsonOk({ intent: row, mpesa_live: mpesaConfigured() })
}, 'v2/payments/mpesa')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = bodySchema.parse(await request.json())

  const result = await initiateStkPush({
    tenantId: ctx.tenantId,
    amount: body.amount,
    phoneNumber: body.phone_number,
    orderId: body.order_id,
    description: body.description,
    metadata: body.purpose ? { purpose: body.purpose } : undefined,
  })

  return jsonOk(result, 201)
}, 'v2/payments/mpesa')

const simulateSchema = z.object({ payment_intent_id: z.string().min(1) })

export const PATCH = apiHandler(async (request: NextRequest) => {
  if (process.env.NODE_ENV === 'production' && mpesaConfigured()) {
    throw notFound('Simulate not available in production with live M-Pesa')
  }
  const ctx = await requirePermission('integrations.write')
  const body = simulateSchema.parse(await request.json())
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM payment_intents WHERE id = ? AND ${tenantWhere()} AND provider = 'mpesa'`,
    [body.payment_intent_id, ctx.tenantId],
  )
  if (!row) throw notFound('Payment intent not found')
  await simulateMpesaStkSuccess(body.payment_intent_id)
  return jsonOk({ simulated: true })
}, 'v2/payments/mpesa')

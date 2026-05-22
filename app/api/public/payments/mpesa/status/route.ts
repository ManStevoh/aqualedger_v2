import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { queryOne } from '@/lib/db'

/** Public payment intent status for guest checkout polling (id is unguessable UUID) */
export const GET = apiHandler(async (request: NextRequest) => {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) throw notFound('Payment intent id required')

  const row = await queryOne<{
    id: string
    status: string
    amount: number
    order_id: string | null
    external_ref: string | null
    updated_at: string
  }>(
    `SELECT id, status, amount, order_id, external_ref, updated_at
     FROM payment_intents WHERE id = ? AND provider = 'mpesa'`,
    [id],
  )
  if (!row) throw notFound('Payment not found')

  let orderNumber: string | null = null
  if (row.order_id) {
    const order = await queryOne<{ order_number: string }>(
      `SELECT order_number FROM orders WHERE id = ?`,
      [row.order_id],
    )
    orderNumber = order?.order_number ?? null
  }

  return jsonOk({
    intent: {
      id: row.id,
      status: row.status,
      amount: row.amount,
      orderId: row.order_id,
      orderNumber,
    },
  })
}, 'public/payments/mpesa/status')

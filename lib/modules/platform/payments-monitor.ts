import { query, queryOne } from '@/lib/db'

export type PaymentIntentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type PaymentProvider = 'mpesa' | 'stripe' | 'cash' | 'bank'

export interface PaymentIntentListItem {
  id: string
  tenantId: string
  tenantName: string
  tenantSlug: string
  orderId: string | null
  provider: PaymentProvider
  amount: number
  currency: string
  status: string
  externalRef: string | null
  createdAt: string
  updatedAt: string
}

export interface ListPaymentIntentsOptions {
  status?: string
  provider?: string
  limit?: number
  page?: number
}

export interface ListPaymentIntentsResult {
  items: PaymentIntentListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaymentStats {
  periodDays: number
  total: number
  byStatus: Record<string, number>
  totalAmount: number
  succeededAmount: number
}

export async function listPaymentIntents(
  opts: ListPaymentIntentsOptions = {},
): Promise<ListPaymentIntentsResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const page = Math.max(opts.page ?? 1, 1)
  const offset = (page - 1) * limit

  const conditions: string[] = ['1=1']
  const params: unknown[] = []

  if (opts.status) {
    conditions.push('pi.status = ?')
    params.push(opts.status)
  }
  if (opts.provider) {
    conditions.push('pi.provider = ?')
    params.push(opts.provider)
  }

  const where = conditions.join(' AND ')

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM payment_intents pi WHERE ${where}`,
    params,
  )
  const total = Number(totalRow?.total ?? 0)

  const rows = await query<{
    id: string
    tenant_id: string
    tenant_name: string
    tenant_slug: string
    order_id: string | null
    provider: PaymentProvider
    amount: number
    currency: string
    status: string
    external_ref: string | null
    created_at: string
    updated_at: string
  }>(
    `SELECT
       pi.id,
       pi.tenant_id,
       t.name AS tenant_name,
       t.slug AS tenant_slug,
       pi.order_id,
       pi.provider,
       pi.amount,
       pi.currency,
       pi.status,
       pi.external_ref,
       pi.created_at,
       pi.updated_at
     FROM payment_intents pi
     INNER JOIN tenants t ON t.id = pi.tenant_id
     WHERE ${where}
     ORDER BY pi.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params,
  )

  return {
    items: rows.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      tenantName: r.tenant_name,
      tenantSlug: r.tenant_slug,
      orderId: r.order_id,
      provider: r.provider,
      amount: Number(r.amount),
      currency: r.currency,
      status: r.status,
      externalRef: r.external_ref,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    })),
    page,
    limit,
    total,
    totalPages: total > 0 ? Math.ceil(total / limit) : 0,
  }
}

export async function getPaymentStats(periodDays = 7): Promise<PaymentStats> {
  const days = Math.min(Math.max(periodDays, 1), 90)

  const byStatusRows = await query<{ status: string; count: number; amount: number }>(
    `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
     FROM payment_intents
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
     GROUP BY status`,
    [],
  )

  const byStatus: Record<string, number> = {}
  let total = 0
  let totalAmount = 0
  let succeededAmount = 0

  for (const row of byStatusRows) {
    const count = Number(row.count)
    const amount = Number(row.amount)
    byStatus[row.status] = count
    total += count
    totalAmount += amount
    if (row.status === 'succeeded' || row.status === 'completed') {
      succeededAmount += amount
    }
  }

  return {
    periodDays: days,
    total,
    byStatus,
    totalAmount,
    succeededAmount,
  }
}

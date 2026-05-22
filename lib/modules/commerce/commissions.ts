import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type { PayoutCreateInput } from './schemas'

export interface VendorCommissionRow {
  id: string
  tenant_id: string
  vendor_id: string
  order_id: string
  order_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  created_at: string
  vendor_name?: string | null
  order_number?: string | null
}

export interface VendorPayoutRow {
  id: string
  tenant_id: string
  vendor_id: string
  payout_number: string
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  vendor_name?: string | null
}

function payoutNumber(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function listCommissions(
  tenantId: string,
  opts: { vendorId?: string; status?: string; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 20, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('vc')]
  const params: unknown[] = [tenantId]

  if (opts.vendorId) {
    conditions.push('vc.vendor_id = ?')
    params.push(opts.vendorId)
  }
  if (opts.status) {
    conditions.push('vc.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM vendor_commissions vc ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const commissions = await query<VendorCommissionRow>(
    `SELECT vc.*,
            mv.shop_name as vendor_name,
            o.order_number
     FROM vendor_commissions vc
     LEFT JOIN marketplace_vendors mv ON vc.vendor_id = mv.id
     LEFT JOIN orders o ON vc.order_id = o.id
     ${where}
     ORDER BY vc.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return {
    commissions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function listPayouts(
  tenantId: string,
  opts: { vendorId?: string; status?: string; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 20, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('vp')]
  const params: unknown[] = [tenantId]

  if (opts.vendorId) {
    conditions.push('vp.vendor_id = ?')
    params.push(opts.vendorId)
  }
  if (opts.status) {
    conditions.push('vp.status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM vendor_payouts vp ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const payouts = await query<VendorPayoutRow>(
    `SELECT vp.*, mv.shop_name as vendor_name
     FROM vendor_payouts vp
     LEFT JOIN marketplace_vendors mv ON vp.vendor_id = mv.id
     ${where}
     ORDER BY vp.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return {
    payouts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createPayout(
  tenantId: string,
  input: PayoutCreateInput,
): Promise<VendorPayoutRow> {
  const vendor = await queryOne<{ id: string; shop_name: string }>(
    `SELECT id, shop_name FROM marketplace_vendors
     WHERE id = ? AND ${tenantWhere()}`,
    [input.vendorId, tenantId],
  )
  if (!vendor) throw notFound('Vendor not found')

  const commissionConditions = [
    tenantWhere('vc'),
    'vc.vendor_id = ?',
    "vc.status = 'payable'",
  ]
  const commissionParams: unknown[] = [tenantId, input.vendorId]

  if (input.commissionIds?.length) {
    commissionConditions.push(
      `vc.id IN (${input.commissionIds.map(() => '?').join(',')})`,
    )
    commissionParams.push(...input.commissionIds)
  }

  const commissions = await query<{ id: string; commission_amount: number }>(
    `SELECT id, commission_amount FROM vendor_commissions vc
     WHERE ${commissionConditions.join(' AND ')}`,
    commissionParams,
  )

  if (commissions.length === 0) {
    throw conflict('No payable commissions found for this vendor')
  }

  const amount = commissions.reduce(
    (sum, row) => sum + Number(row.commission_amount),
    0,
  )
  const payoutId = generateId()
  const number = payoutNumber()

  await execute(
    `INSERT INTO vendor_payouts (
      id, tenant_id, vendor_id, payout_number, amount, currency, status
    ) VALUES (?, ?, ?, ?, ?, ?, 'processing')`,
    [payoutId, tenantId, input.vendorId, number, amount, input.currency ?? 'KES'],
  )

  const ids = commissions.map((c) => c.id)
  await execute(
    `UPDATE vendor_commissions SET status = 'paid'
     WHERE id IN (${ids.map(() => '?').join(',')}) AND ${tenantWhere()}`,
    [...ids, tenantId],
  )

  const payout = await queryOne<VendorPayoutRow>(
    `SELECT vp.*, mv.shop_name as vendor_name
     FROM vendor_payouts vp
     LEFT JOIN marketplace_vendors mv ON vp.vendor_id = mv.id
     WHERE vp.id = ?`,
    [payoutId],
  )
  if (!payout) throw new Error('Failed to create payout')
  return payout
}

export async function markPayoutPaid(
  tenantId: string,
  payoutId: string,
): Promise<VendorPayoutRow> {
  const existing = await queryOne<VendorPayoutRow>(
    `SELECT * FROM vendor_payouts WHERE id = ? AND ${tenantWhere()}`,
    [payoutId, tenantId],
  )
  if (!existing) throw notFound('Payout not found')
  if (existing.status === 'paid') throw conflict('Payout is already paid')

  await execute(
    `UPDATE vendor_payouts SET status = 'paid', paid_at = NOW()
     WHERE id = ? AND ${tenantWhere()}`,
    [payoutId, tenantId],
  )

  const payout = await queryOne<VendorPayoutRow>(
    `SELECT vp.*, mv.shop_name as vendor_name
     FROM vendor_payouts vp
     LEFT JOIN marketplace_vendors mv ON vp.vendor_id = mv.id
     WHERE vp.id = ?`,
    [payoutId],
  )
  if (!payout) throw new Error('Failed to update payout')
  return payout
}

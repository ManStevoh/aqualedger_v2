import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function runThreeWayMatch(tenantId: string, purchaseOrderId: string) {
  const po = await queryOne<{
    id: string
    total_amount: number
    supplier_id: string
    status: string
  }>(
    `SELECT id, total_amount, supplier_id, status FROM purchase_orders
     WHERE id = ? AND ${tenantWhere()}`,
    [purchaseOrderId, tenantId],
  )
  if (!po) return null

  const grns = await query<{ id: string; received_date: string }>(
    `SELECT id, received_date FROM goods_receipts
     WHERE purchase_order_id = ? AND ${tenantWhere()} AND status = 'posted'`,
    [purchaseOrderId, tenantId],
  )

  const ap = await queryOne<{ id: string; total_amount: number }>(
    `SELECT id, total_amount FROM ap_invoices
     WHERE purchase_order_id = ? AND ${tenantWhere()} AND status != 'void'
     ORDER BY created_at DESC LIMIT 1`,
    [purchaseOrderId, tenantId],
  )

  const poAmount = Number(po.total_amount)
  const receivedAmount = grns.length > 0 ? poAmount : 0
  const invoicedAmount = ap ? Number(ap.total_amount) : 0
  const variance = Math.abs(poAmount - invoicedAmount)
  const tolerance = poAmount * 0.02

  let status: 'pending' | 'matched' | 'variance' | 'blocked' = 'pending'
  if (!grns.length) status = 'pending'
  else if (!ap) status = 'pending'
  else if (variance <= tolerance && receivedAmount > 0) status = 'matched'
  else if (variance > tolerance) status = 'variance'
  else status = 'blocked'

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM procurement_match_records WHERE purchase_order_id = ? AND ${tenantWhere()}`,
    [purchaseOrderId, tenantId],
  )

  const grnId = grns[0]?.id ?? null
  const apId = ap?.id ?? null

  if (existing) {
    await execute(
      `UPDATE procurement_match_records SET
        grn_id = ?, ap_invoice_id = ?, po_amount = ?, received_amount = ?, invoiced_amount = ?,
        variance_amount = ?, status = ?, matched_at = IF(? = 'matched', NOW(), matched_at)
       WHERE id = ?`,
      [
        grnId,
        apId,
        poAmount,
        receivedAmount,
        invoicedAmount,
        variance,
        status,
        status,
        existing.id,
      ],
    )
    return { id: existing.id, status, poAmount, receivedAmount, invoicedAmount, variance }
  }

  const id = generateId()
  await execute(
    `INSERT INTO procurement_match_records (
      id, tenant_id, purchase_order_id, grn_id, ap_invoice_id,
      po_amount, received_amount, invoiced_amount, variance_amount, status, matched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(? = 'matched', NOW(), NULL))`,
    [
      id,
      tenantId,
      purchaseOrderId,
      grnId,
      apId,
      poAmount,
      receivedAmount,
      invoicedAmount,
      variance,
      status,
      status,
    ],
  )
  return { id, status, poAmount, receivedAmount, invoicedAmount, variance }
}

export async function listMatchRecords(tenantId: string, limit = 50) {
  return query(
    `SELECT m.*, po.po_number, po.supplier_id
     FROM procurement_match_records m
     JOIN purchase_orders po ON m.purchase_order_id = po.id
     WHERE m.tenant_id = ?
     ORDER BY m.created_at DESC LIMIT ?`,
    [tenantId, limit],
  )
}

export async function linkApInvoiceToPo(
  tenantId: string,
  apInvoiceId: string,
  purchaseOrderId: string,
  grnId?: string | null,
) {
  await execute(
    `UPDATE ap_invoices SET purchase_order_id = ?, grn_id = ? WHERE id = ? AND ${tenantWhere()}`,
    [purchaseOrderId, grnId ?? null, apInvoiceId, tenantId],
  )
  return runThreeWayMatch(tenantId, purchaseOrderId)
}

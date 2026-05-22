import { queryOne } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import { createApInvoice } from './service'
import { runThreeWayMatch } from '@/lib/modules/procurement/three-way-match'

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function createApInvoiceFromPurchaseOrder(
  tenantId: string,
  purchaseOrderId: string,
  opts: { invoiceNumber?: string; postToGl?: boolean; userId?: string } = {},
) {
  const po = await queryOne<{
    id: string
    po_number: string
    supplier_id: string
    subtotal: number
    tax_amount: number
    total_amount: number
    status: string
  }>(
    `SELECT id, po_number, supplier_id, subtotal, tax_amount, total_amount, status
     FROM purchase_orders WHERE id = ? AND ${tenantWhere()}`,
    [purchaseOrderId, tenantId],
  )
  if (!po) throw notFound('Purchase order not found')
  if (po.status === 'cancelled') throw conflict('Cannot invoice a cancelled PO')

  const existing = await queryOne<{ id: string; invoice_number: string }>(
    `SELECT id, invoice_number FROM ap_invoices
     WHERE purchase_order_id = ? AND ${tenantWhere()} AND status != 'void'`,
    [purchaseOrderId, tenantId],
  )
  if (existing) {
    throw conflict(`PO already invoiced as ${existing.invoice_number}`)
  }

  const grn = await queryOne<{ id: string }>(
    `SELECT id FROM goods_receipts
     WHERE purchase_order_id = ? AND ${tenantWhere()} AND status = 'posted'
     ORDER BY received_date DESC LIMIT 1`,
    [purchaseOrderId, tenantId],
  )

  const invoiceDate = new Date().toISOString().slice(0, 10)
  const safeNum = (po.po_number || po.id.slice(0, 8)).replace(/[^a-zA-Z0-9-]/g, '')
  const invoiceNumber = opts.invoiceNumber?.trim() || `AP-${safeNum}`

  const invoice = await createApInvoice(tenantId, {
    supplierId: po.supplier_id,
    purchaseOrderId: po.id,
    grnId: grn?.id ?? null,
    invoiceNumber,
    invoiceDate,
    dueDate: addDays(invoiceDate, 30),
    currency: 'KES',
    subtotal: Number(po.subtotal),
    taxAmount: Number(po.tax_amount),
    totalAmount: Number(po.total_amount),
    status: 'draft',
  })

  await runThreeWayMatch(tenantId, purchaseOrderId)

  let journalEntryId: string | undefined
  if (opts.postToGl && opts.userId) {
    const { postApInvoiceToGl } = await import('./subledger-posting')
    const posted = await postApInvoiceToGl(tenantId, invoice.id, opts.userId)
    journalEntryId = posted.journalEntryId
  }

  return { invoice, journalEntryId, matchRan: true }
}

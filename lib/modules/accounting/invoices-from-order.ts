import { queryOne } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import { createArInvoice } from './service'

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function createArInvoiceFromOrder(
  tenantId: string,
  orderId: string,
  opts: { postToGl?: boolean; userId?: string } = {},
) {
  const order = await queryOne<{
    id: string
    order_number: string
    buyer_id: string
    guest_email: string | null
    subtotal: number
    tax: number
    total: number
    status: string
    created_at: string
  }>(
    `SELECT id, order_number, buyer_id, guest_email, subtotal, tax, total, status, created_at
     FROM orders WHERE id = ? AND ${tenantWhere()}`,
    [orderId, tenantId],
  )
  if (!order) throw notFound('Order not found')

  const existing = await queryOne<{ id: string; invoice_number: string }>(
    `SELECT id, invoice_number FROM ar_invoices WHERE order_id = ? AND ${tenantWhere()} AND status != 'void'`,
    [orderId, tenantId],
  )
  if (existing) {
    throw conflict(`Order already invoiced as ${existing.invoice_number}`)
  }

  let customerId: string | null = null
  const byUser = await queryOne<{ id: string }>(
    `SELECT id FROM crm_customers WHERE ${tenantWhere()} AND user_id = ? LIMIT 1`,
    [tenantId, order.buyer_id],
  )
  if (byUser) {
    customerId = byUser.id
  } else if (order.guest_email) {
    const byEmail = await queryOne<{ id: string }>(
      `SELECT id FROM crm_customers WHERE ${tenantWhere()} AND email = ? LIMIT 1`,
      [tenantId, order.guest_email],
    )
    customerId = byEmail?.id ?? null
  }

  const invoiceDate = new Date().toISOString().slice(0, 10)
  const subtotal = Number(order.subtotal)
  const taxAmount = Number(order.tax)
  const totalAmount = Number(order.total)
  const safeNum = (order.order_number || order.id.slice(0, 8)).replace(/[^a-zA-Z0-9-]/g, '')
  const invoiceNumber = `INV-${safeNum}`

  const invoice = await createArInvoice(tenantId, {
    customerId,
    orderId: order.id,
    invoiceNumber,
    invoiceDate,
    dueDate: addDays(invoiceDate, 30),
    currency: 'KES',
    subtotal,
    taxAmount,
    totalAmount,
    status: 'sent',
  })

  let journalEntryId: string | undefined
  if (opts.postToGl && opts.userId) {
    const { postArInvoiceToGl } = await import('./subledger-posting')
    const posted = await postArInvoiceToGl(tenantId, invoice.id, opts.userId)
    journalEntryId = posted.journalEntryId
  }

  return { invoice, journalEntryId }
}

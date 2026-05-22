import { queryOne } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatMoney(n: number, currency: string): string {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(n)
}

export async function renderArInvoiceHtml(tenantId: string, invoiceId: string): Promise<string> {
  const row = await queryOne<{
    invoice_number: string
    invoice_date: string
    due_date: string | null
    subtotal: number
    tax_amount: number
    total_amount: number
    status: string
    currency: string
    customer_name: string | null
    order_number: string | null
    tenant_name: string
  }>(
    `SELECT ar.*, c.name as customer_name, o.order_number, t.name as tenant_name
     FROM ar_invoices ar
     LEFT JOIN crm_customers c ON ar.customer_id = c.id
     LEFT JOIN orders o ON ar.order_id = o.id
     JOIN tenants t ON ar.tenant_id = t.id
     WHERE ar.id = ? AND ${tenantWhere('ar')}`,
    [invoiceId, tenantId],
  )
  if (!row) throw notFound('Invoice not found')

  return buildHtml({
    title: 'Tax Invoice',
    issuer: row.tenant_name,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    partyLabel: 'Bill to',
    partyName: row.customer_name || 'Customer',
    reference: row.order_number ? `Order ${row.order_number}` : null,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax_amount),
    total: Number(row.total_amount),
    currency: row.currency,
    status: row.status,
  })
}

export async function renderApInvoiceHtml(tenantId: string, invoiceId: string): Promise<string> {
  const row = await queryOne<{
    invoice_number: string
    invoice_date: string
    due_date: string | null
    subtotal: number
    tax_amount: number
    total_amount: number
    status: string
    currency: string
    supplier_name: string | null
    po_number: string | null
    tenant_name: string
  }>(
    `SELECT ap.*, s.name as supplier_name, po.po_number, t.name as tenant_name
     FROM ap_invoices ap
     LEFT JOIN suppliers s ON ap.supplier_id = s.id
     LEFT JOIN purchase_orders po ON ap.purchase_order_id = po.id
     JOIN tenants t ON ap.tenant_id = t.id
     WHERE ap.id = ? AND ${tenantWhere('ap')}`,
    [invoiceId, tenantId],
  )
  if (!row) throw notFound('Invoice not found')

  return buildHtml({
    title: 'Supplier Invoice',
    issuer: row.tenant_name,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    partyLabel: 'Supplier',
    partyName: row.supplier_name || 'Supplier',
    reference: row.po_number ? `PO ${row.po_number}` : null,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax_amount),
    total: Number(row.total_amount),
    currency: row.currency,
    status: row.status,
  })
}

function buildHtml(opts: {
  title: string
  issuer: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string | null
  partyLabel: string
  partyName: string
  reference: string | null
  subtotal: number
  tax: number
  total: number
  currency: string
  status: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.invoiceNumber)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #111; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #ddd; }
    td.num { text-align: right; }
    .total { font-weight: 700; font-size: 1.1rem; }
    @media print { body { margin: 1cm; } button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()" style="margin-bottom:1rem;padding:0.5rem 1rem">Print / Save PDF</button>
  <h1>${escapeHtml(opts.title)}</h1>
  <p class="muted">${escapeHtml(opts.issuer)}</p>
  <p><strong>Invoice #</strong> ${escapeHtml(opts.invoiceNumber)} · <strong>Date</strong> ${escapeHtml(opts.invoiceDate)}${
    opts.dueDate ? ` · <strong>Due</strong> ${escapeHtml(opts.dueDate)}` : ''
  }</p>
  <p><strong>${escapeHtml(opts.partyLabel)}:</strong> ${escapeHtml(opts.partyName)}${
    opts.reference ? ` · ${escapeHtml(opts.reference)}` : ''
  }</p>
  <p class="muted">Status: ${escapeHtml(opts.status)}</p>
  <table>
    <tr><th>Description</th><th class="num">Amount</th></tr>
    <tr><td>Subtotal</td><td class="num">${formatMoney(opts.subtotal, opts.currency)}</td></tr>
    <tr><td>Tax</td><td class="num">${formatMoney(opts.tax, opts.currency)}</td></tr>
    <tr class="total"><td>Total</td><td class="num">${formatMoney(opts.total, opts.currency)}</td></tr>
  </table>
</body>
</html>`
}

import { queryOne, execute } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import { createJournalEntry } from './service'
import { getGlAccountByCode } from './gl-accounts'

export async function postApInvoiceToGl(tenantId: string, invoiceId: string, userId: string) {
  const inv = await queryOne<{
    id: string
    total_amount: number
    tax_amount: number
    subtotal: number
    invoice_date: string
    gl_journal_id: string | null
    status: string
  }>(
    `SELECT * FROM ap_invoices WHERE id = ? AND ${tenantWhere()}`,
    [invoiceId, tenantId],
  )
  if (!inv) throw notFound('AP invoice not found')
  if (inv.gl_journal_id) throw conflict('Already posted')
  if (inv.status === 'void') throw conflict('Cannot post void invoice')

  const expense = await getGlAccountByCode(tenantId, '5000')
  const ap = await getGlAccountByCode(tenantId, '2000')
  const vat = await getGlAccountByCode(tenantId, '2200')
  if (!expense || !ap) throw conflict('GL accounts missing')

  const total = Number(inv.total_amount)
  const tax = Number(inv.tax_amount)
  const net = total - tax

  const entry = await createJournalEntry(tenantId, userId, {
    entryDate: String(inv.invoice_date).slice(0, 10),
    description: `AP invoice ${invoiceId.slice(0, 8)}`,
    referenceType: 'ap_invoice',
    referenceId: invoiceId,
    lines: [
      { accountId: expense.id, debit: net, credit: 0 },
      ...(tax > 0 && vat ? [{ accountId: vat.id, debit: tax, credit: 0 }] : []),
      { accountId: ap.id, debit: 0, credit: total },
    ],
  })

  await execute(
    `UPDATE ap_invoices SET gl_journal_id = ?, status = 'approved' WHERE id = ?`,
    [entry.id, invoiceId],
  )
  return { journalEntryId: entry.id }
}

export async function postArInvoiceToGl(tenantId: string, invoiceId: string, userId: string) {
  const inv = await queryOne<{
    id: string
    total_amount: number
    tax_amount: number
    invoice_date: string
    gl_journal_id: string | null
  }>(
    `SELECT * FROM ar_invoices WHERE id = ? AND ${tenantWhere()}`,
    [invoiceId, tenantId],
  )
  if (!inv) throw notFound('AR invoice not found')
  if (inv.gl_journal_id) throw conflict('Already posted')

  const ar = await getGlAccountByCode(tenantId, '1100')
  const revenue = await getGlAccountByCode(tenantId, '4000')
  const vat = await getGlAccountByCode(tenantId, '2200')
  if (!ar || !revenue) throw conflict('GL accounts missing')

  const total = Number(inv.total_amount)
  const tax = Number(inv.tax_amount)
  const net = total - tax

  const entry = await createJournalEntry(tenantId, userId, {
    entryDate: String(inv.invoice_date).slice(0, 10),
    description: `AR invoice ${invoiceId.slice(0, 8)}`,
    referenceType: 'ar_invoice',
    referenceId: invoiceId,
    lines: [
      { accountId: ar.id, debit: total, credit: 0 },
      { accountId: revenue.id, debit: 0, credit: net },
      ...(tax > 0 && vat ? [{ accountId: vat.id, debit: 0, credit: tax }] : []),
    ],
  })

  await execute(`UPDATE ar_invoices SET gl_journal_id = ? WHERE id = ?`, [entry.id, invoiceId])
  return { journalEntryId: entry.id }
}

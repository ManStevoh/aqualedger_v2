import { NextResponse } from 'next/server'
import { apiHandler } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { renderApInvoiceHtml } from '@/lib/modules/accounting/invoice-document'

export const GET = apiHandler(
  async (_request, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('accounting.ledger.read')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const html = await renderApInvoiceHtml(ctx.tenantId, id)
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  },
  'v2/accounting/ap/document',
)

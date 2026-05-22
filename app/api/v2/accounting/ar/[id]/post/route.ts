import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { postArInvoiceToGl } from '@/lib/modules/accounting/subledger-posting'

export const POST = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('accounting.ledger.write')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const result = await postArInvoiceToGl(ctx.tenantId, id, ctx.userId)
    return jsonOk(result)
  },
  'v2/accounting/ar/[id]/post',
)

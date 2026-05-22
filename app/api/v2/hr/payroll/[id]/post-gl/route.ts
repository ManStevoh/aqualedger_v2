import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { postPayrollRunToGl } from '@/lib/modules/accounting/payroll-gl'

export const POST = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('accounting.ledger.write')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const result = await postPayrollRunToGl(ctx.tenantId, id, ctx.userId)
    return jsonOk(result)
  },
  'v2/hr/payroll/[id]/post-gl',
)

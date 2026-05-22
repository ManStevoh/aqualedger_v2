import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { bankReconciliationUpdateSchema } from '@/lib/modules/accounting/schemas'
import {
  updateBankReconciliation,
  deleteBankReconciliation,
} from '@/lib/modules/accounting/bank-reconciliation'

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = bankReconciliationUpdateSchema.parse(await request.json())
  const reconciliation = await updateBankReconciliation(ctx.tenantId, id, body)
  return jsonOk({ reconciliation })
}, 'v2/accounting/bank-reconciliation/[id]')

export const DELETE = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  await deleteBankReconciliation(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/accounting/bank-reconciliation/[id]')

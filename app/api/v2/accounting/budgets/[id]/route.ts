import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { budgetUpdateSchema } from '@/lib/modules/accounting/schemas'
import { updateBudget, deleteBudget } from '@/lib/modules/accounting/budgets'

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = budgetUpdateSchema.parse(await request.json())
  const budget = await updateBudget(ctx.tenantId, id, body)
  return jsonOk({ budget })
}, 'v2/accounting/budgets/[id]')

export const DELETE = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  await deleteBudget(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/accounting/budgets/[id]')

import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { budgetCreateSchema, budgetListQuerySchema } from '@/lib/modules/accounting/schemas'
import { listBudgets, createBudget } from '@/lib/modules/accounting/budgets'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.reports.read')
  const { searchParams } = new URL(request.url)
  const query = budgetListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    fiscalYear: searchParams.get('fiscalYear') ?? undefined,
  })

  const { budgets, total } = await listBudgets(ctx.tenantId, query)
  return jsonOk({
    budgets,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  })
}, 'v2/accounting/budgets')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = budgetCreateSchema.parse(await request.json())
  const budget = await createBudget(ctx.tenantId, body)
  return jsonOk({ budget }, 201)
}, 'v2/accounting/budgets')

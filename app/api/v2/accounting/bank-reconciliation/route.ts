import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  bankReconciliationCreateSchema,
  bankReconciliationListQuerySchema,
} from '@/lib/modules/accounting/schemas'
import {
  listBankReconciliations,
  createBankReconciliation,
} from '@/lib/modules/accounting/bank-reconciliation'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.read')
  const { searchParams } = new URL(request.url)
  const query = bankReconciliationListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const { reconciliations, total } = await listBankReconciliations(ctx.tenantId, query)
  return jsonOk({
    reconciliations,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  })
}, 'v2/accounting/bank-reconciliation')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = bankReconciliationCreateSchema.parse(await request.json())
  const reconciliation = await createBankReconciliation(ctx.tenantId, body)
  return jsonOk({ reconciliation }, 201)
}, 'v2/accounting/bank-reconciliation')

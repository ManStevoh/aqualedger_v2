import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { getAuthContext, requirePermission } from '@/lib/platform/access'
import { hasPermission } from '@/lib/platform/permissions'
import { queryOne } from '@/lib/db'
import { arInvoiceCreateSchema, invoiceListQuerySchema } from '@/lib/modules/accounting/schemas'
import { listArInvoices, createArInvoice } from '@/lib/modules/accounting/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await getAuthContext()
  const isCustomer = ctx.memberRole === 'customer'
  if (!isCustomer && !hasPermission(ctx.memberRole, 'accounting.ledger.read', ctx.role, ctx.rolePermissions)) {
    throw new Error('Forbidden')
  }

  const { searchParams } = new URL(request.url)
  const query = invoiceListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  let customerId: string | undefined = undefined
  if (isCustomer) {
    const cust = await queryOne<{ id: string }>(
      `SELECT id FROM crm_customers WHERE tenant_id = ? AND user_id = ?`,
      [ctx.tenantId, ctx.userId]
    )
    if (!cust) {
      return jsonOk({
        invoices: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 1,
        },
      })
    }
    customerId = cust.id
  }

  const { invoices, total } = await listArInvoices(ctx.tenantId, {
    ...query,
    customerId,
  })

  return jsonOk({
    invoices,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  })
}, 'v2/accounting/ar')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = arInvoiceCreateSchema.parse(await request.json())
  const invoice = await createArInvoice(ctx.tenantId, body)
  return jsonOk({ invoice }, 201)
}, 'v2/accounting/ar')

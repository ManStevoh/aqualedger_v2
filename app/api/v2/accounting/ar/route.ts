import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { arInvoiceCreateSchema, invoiceListQuerySchema } from '@/lib/modules/accounting/schemas'
import { listArInvoices, createArInvoice } from '@/lib/modules/accounting/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.read')
  const { searchParams } = new URL(request.url)
  const query = invoiceListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const { invoices, total } = await listArInvoices(ctx.tenantId, query)
  return jsonOk({
    invoices,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  })
}, 'v2/accounting/ap')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('accounting.ledger.write')
  const body = arInvoiceCreateSchema.parse(await request.json())
  const invoice = await createArInvoice(ctx.tenantId, body)
  return jsonOk({ invoice }, 201)
}, 'v2/accounting/ar')

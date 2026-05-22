import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  customerCreateSchema,
  customerListQuerySchema,
} from '@/lib/modules/crm/schemas'
import { listCustomers, createCustomer } from '@/lib/modules/crm/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.read')
  const { searchParams } = new URL(request.url)
  const query = customerListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    segment: searchParams.get('segment') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const data = await listCustomers(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/crm/customers')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.write')
  const body = customerCreateSchema.parse(await request.json())
  const customer = await createCustomer(ctx.tenantId, body)
  return jsonOk({ customer }, 201)
}, 'v2/crm/customers')

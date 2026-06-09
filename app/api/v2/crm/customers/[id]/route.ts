import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { customerUpdateSchema } from '@/lib/modules/crm/schemas'
import { updateCustomer } from '@/lib/modules/crm/service'

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('crm.customers.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  
  const body = customerUpdateSchema.parse(await request.json())
  const customer = await updateCustomer(ctx.tenantId, id, body)
  return jsonOk({ customer })
}, 'v2/crm/customers/[id]')

import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { exportCustomerData } from '@/lib/modules/crm/service'

export const GET = apiHandler(async (_request, context) => {
  const ctx = await requirePermission('crm.customers.read')
  const params = await context?.params
  const customerId = params?.id
  if (!customerId) {
    throw new Error('Customer id is required')
  }

  const exportBundle = await exportCustomerData(ctx.tenantId, customerId)
  return jsonOk({ export: exportBundle })
}, 'v2/crm/customers/[id]/export')

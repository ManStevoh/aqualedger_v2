import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { listTenantBilling } from '@/lib/modules/platform/billing-overview'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const { tenants, summary } = await listTenantBilling()
  return jsonOk({ tenants, summary })
}, 'v2/platform/billing')

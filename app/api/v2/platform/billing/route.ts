import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { listTenantBilling } from '@/lib/modules/platform/billing-overview'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const tenants = await listTenantBilling()
  return jsonOk({ tenants })
}, 'v2/platform/billing')

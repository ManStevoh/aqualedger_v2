import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getTenantHostingInfo } from '@/lib/modules/tenant/hosting'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')
  const hosting = await getTenantHostingInfo(ctx.tenantId)
  if (!hosting) {
    return jsonOk({ hosting: null })
  }
  return jsonOk({ hosting })
}, 'v2/tenant/hosting')

import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth'
import { getAuthContext } from '@/lib/platform/access'
import { getEnabledModuleIdsForTenant } from '@/lib/platform/module-enablement'

/** Tenant-scoped enabled modules (platform flags minus per-tenant overrides) */
export const GET = apiHandler(async () => {
  await requireAuth()
  const ctx = await getAuthContext()
  const enabledModuleIds = [...(await getEnabledModuleIdsForTenant(ctx.tenantId))]
  return jsonOk({ enabledModuleIds })
}, 'v2/tenant/modules')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getTenantDetail } from '@/lib/modules/platform/tenants-admin'
import {
  listTenantFeatureFlags,
  setTenantFeatureFlags,
  TENANT_FEATURE_FLAG_KEYS,
} from '@/lib/modules/platform/tenant-feature-flags'
import { invalidateModuleEnablementCache } from '@/lib/platform/module-enablement'

export const GET = apiHandler(async (_request, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const tenantId = params?.id as string
  const tenant = await getTenantDetail(tenantId)
  if (!tenant) {
    throw notFound('Tenant not found')
  }
  const flags = await listTenantFeatureFlags(tenantId)
  return jsonOk({ tenantId, flags })
}, 'v2/platform/tenants/[id]/flags')

const patchSchema = z.object({
  flags: z.array(
    z.object({
      flagKey: z.enum(TENANT_FEATURE_FLAG_KEYS),
      enabled: z.boolean(),
    }),
  ),
})

export const PATCH = apiHandler(async (request: NextRequest, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const tenantId = params?.id as string
  const tenant = await getTenantDetail(tenantId)
  if (!tenant) {
    throw notFound('Tenant not found')
  }

  const body = patchSchema.parse(await request.json())
  const flags = await setTenantFeatureFlags(tenantId, body.flags)
  invalidateModuleEnablementCache()

  return jsonOk({ tenantId, flags })
}, 'v2/platform/tenants/[id]/flags')

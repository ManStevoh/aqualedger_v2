import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getTenantDetail } from '@/lib/modules/platform/tenants-admin'
import {
  listTenantModuleFlags,
  setTenantModuleFlags,
} from '@/lib/modules/platform/tenant-module-flags'
import { invalidateModuleEnablementCache } from '@/lib/platform/module-enablement'
import { ERP_MODULES, type ModuleId } from '@/lib/platform/modules'

const TOGGLABLE_MODULE_IDS = ERP_MODULES.map((m) => m.id).filter(
  (id): id is ModuleId => id !== 'platform',
)

export const GET = apiHandler(async (_request, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const tenantId = params?.id as string
  const tenant = await getTenantDetail(tenantId)
  if (!tenant) {
    throw notFound('Tenant not found')
  }
  const modules = await listTenantModuleFlags(tenantId)
  return jsonOk({ tenantId, modules })
}, 'v2/platform/tenants/[id]/modules')

const patchSchema = z.object({
  modules: z.array(
    z.object({
      moduleId: z.enum(TOGGLABLE_MODULE_IDS as [string, ...string[]]),
      enabled: z.boolean(),
    }),
  ),
})

export const PATCH = apiHandler(async (request: NextRequest, context) => {
  const auth = await requireSuperAdmin()
  const params = await context?.params
  const tenantId = params?.id as string
  const tenant = await getTenantDetail(tenantId)
  if (!tenant) {
    throw notFound('Tenant not found')
  }

  const body = patchSchema.parse(await request.json())
  const modules = await setTenantModuleFlags(
    tenantId,
    body.modules.map((m) => ({ moduleId: m.moduleId as ModuleId, enabled: m.enabled })),
    auth.userId,
  )
  invalidateModuleEnablementCache()

  return jsonOk({ tenantId, modules })
}, 'v2/platform/tenants/[id]/modules')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, forbidden } from '@/lib/api-handler'
import { requireAuth } from '@/lib/auth'
import {
  getEnabledModuleIds,
  listModuleFlagsForAdmin,
  setModuleEnabled,
  invalidateModuleEnablementCache,
} from '@/lib/platform/module-enablement'

/** Enabled module ids for navigation; ?admin=1 adds full flag list (super_admin only) */
export const GET = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  const enabledModuleIds = [...(await getEnabledModuleIds())]
  const adminView = new URL(request.url).searchParams.get('admin') === '1'
  if (adminView) {
    if (auth.role !== 'super_admin') throw forbidden('Super admin only')
    const flags = await listModuleFlagsForAdmin()
    return jsonOk({ enabledModuleIds, flags })
  }
  return jsonOk({ enabledModuleIds })
}, 'v2/platform/modules')

const patchSchema = z.object({
  modules: z.array(
    z.object({
      moduleId: z.string().min(1).max(32),
      enabled: z.boolean(),
    }),
  ),
})

/** Super admin only — toggle modules platform-wide */
export const PATCH = apiHandler(async (request: NextRequest) => {
  const auth = await requireAuth()
  if (auth.role !== 'super_admin') {
    throw forbidden('Only super administrators can manage platform modules')
  }

  const body = patchSchema.parse(await request.json())
  for (const item of body.modules) {
    await setModuleEnabled(item.moduleId, item.enabled, auth.userId)
  }
  invalidateModuleEnablementCache()

  const flags = await listModuleFlagsForAdmin()
  const enabledModuleIds = [...(await getEnabledModuleIds())]
  return jsonOk({ flags, enabledModuleIds })
}, 'v2/platform/modules')

import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { getTenantDetail } from '@/lib/modules/platform/tenants-admin'

export const GET = apiHandler(async (_request, context) => {
  await requireSuperAdmin()
  const params = await context?.params
  const id = params?.id as string
  const tenant = await getTenantDetail(id)
  if (!tenant) {
    throw notFound('Tenant not found')
  }
  return jsonOk({ tenant })
}, 'v2/platform/tenants/[id]')

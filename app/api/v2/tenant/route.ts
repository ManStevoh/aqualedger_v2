import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  getTenant,
  listBranches,
  listTenantMembers,
  updateTenantSettings,
  getSubscriptionPlanDisplay,
} from '@/lib/modules/tenant/service'

const patchSchema = z.object({
  taxTin: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  branding: z
    .object({
      logo_url: z.string().max(500).optional(),
      primary_color: z.string().max(20).optional(),
    })
    .optional(),
  name: z.string().min(1).max(200).optional(),
  defaultCurrency: z.string().length(3).optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')

  const [tenant, branches, members] = await Promise.all([
    getTenant(ctx.tenantId),
    listBranches(ctx.tenantId),
    listTenantMembers(ctx.tenantId),
  ])

  const subscription = getSubscriptionPlanDisplay(tenant.plan)

  return jsonOk({ tenant, branches, members, subscription })
}, 'v2/tenant')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = await request.json()
  const input = patchSchema.parse(body)
  const tenant = await updateTenantSettings(ctx.tenantId, input)
  const subscription = getSubscriptionPlanDisplay(tenant.plan)
  return jsonOk({ tenant, subscription })
}, 'v2/tenant')

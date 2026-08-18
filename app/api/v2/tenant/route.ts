import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { queryOne } from '@/lib/db'
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
  timezone: z.string().max(64).optional(),
  bankName: z.string().max(200).optional(),
  bankBranch: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(50).optional(),
  bankAccountName: z.string().max(200).optional(),
  bankSwiftCode: z.string().max(20).optional(),
  mpesaPaybill: z.string().max(20).optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')

  const [tenant, branches, members, productCountRow] = await Promise.all([
    getTenant(ctx.tenantId),
    listBranches(ctx.tenantId),
    listTenantMembers(ctx.tenantId),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM product_catalog WHERE tenant_id = ?`,
      [ctx.tenantId],
    ),
  ])

  const subscription = getSubscriptionPlanDisplay(tenant.plan, tenant)

  return jsonOk({
    tenant,
    branches,
    members,
    subscription,
    productCount: Number(productCountRow?.count ?? 0),
  })
}, 'v2/tenant')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = await request.json()
  const input = patchSchema.parse(body)
  const tenant = await updateTenantSettings(ctx.tenantId, input)
  const subscription = getSubscriptionPlanDisplay(tenant.plan)
  return jsonOk({ tenant, subscription })
}, 'v2/tenant')

import { z } from 'zod'
import { apiHandler, jsonOk, notFound, ApiError } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import {
  listTenantsWithStats,
  updateTenant,
  type TenantPlan,
  type TenantStatus,
} from '@/lib/modules/platform/tenants-admin'
import { provisionTenant } from '@/lib/modules/platform/provision-tenant'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()
  const tenants = await listTenantsWithStats()
  return jsonOk({ tenants })
}, 'v2/platform/tenants')

const postSchema = z.object({
  organizationName: z.string().min(2).max(200),
  ownerEmail: z.string().email(),
  ownerFirstName: z.string().max(100).optional(),
  ownerLastName: z.string().max(100).optional(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
  businessType: z
    .enum(['fisherman', 'cooperative', 'processor', 'market', 'exporter', 'restaurant', 'logistics'])
    .optional(),
})

export const POST = apiHandler(async (request) => {
  const admin = await requireSuperAdmin()
  const body = postSchema.parse(await request.json())
  const result = await provisionTenant(body, admin.userId)
  return jsonOk({ ...result }, 201)
}, 'v2/platform/tenants')

const patchSchema = z.object({
  id: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  status: z.enum(['active', 'suspended', 'pending', 'cancelled']).optional(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
})

export const PATCH = apiHandler(async (request) => {
  await requireSuperAdmin()
  const body = patchSchema.parse(await request.json())
  const tenantId = body.id ?? body.tenantId
  if (!tenantId) {
    throw new ApiError('tenantId or id is required')
  }
  if (!body.status && !body.plan) {
    throw new ApiError('Provide status and/or plan to update')
  }
  const tenant = await updateTenant(tenantId, {
    status: body.status as TenantStatus | undefined,
    plan: body.plan as TenantPlan | undefined,
  })
  if (!tenant) {
    throw notFound('Tenant not found')
  }
  return jsonOk({ tenant })
}, 'v2/platform/tenants')

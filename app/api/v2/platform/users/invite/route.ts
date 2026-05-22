import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { inviteUserToTenant } from '@/lib/modules/platform/invite-user'
import type { TenantMemberRole } from '@/lib/tenant'

const memberRoles = [
  'tenant_owner',
  'branch_manager',
  'accountant',
  'procurement_officer',
  'warehouse_staff',
  'fisherman',
  'vendor',
  'delivery_staff',
  'customer',
  'hr_officer',
  'bmu_official',
] as const

const postSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(memberRoles),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  await requireSuperAdmin()
  const body = postSchema.parse(await request.json())
  const result = await inviteUserToTenant({
    tenantId: body.tenantId,
    email: body.email,
    role: body.role as TenantMemberRole,
    firstName: body.firstName,
    lastName: body.lastName,
  })
  return jsonOk(result, 201)
}, 'v2/platform/users/invite')

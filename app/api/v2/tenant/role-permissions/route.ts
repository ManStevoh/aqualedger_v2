import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listTenantPortalRoleMaps,
  updateTenantPortalRolePermissions,
  seedTenantRolePermissions,
  isPortalRole,
} from '@/lib/platform/tenant-role-permissions'

const updateSchema = z.object({
  role: z.enum(['vendor', 'customer']),
  permissions: z.array(z.string()),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.members.manage')
  const roles = await listTenantPortalRoleMaps(ctx.tenantId)
  return jsonOk({
    roles,
    loginNote:
      'Vendors and clients can sign in at /login with their email once invited. They need an active tenant_members row with role vendor or customer.',
  })
}, 'v2/tenant/role-permissions')

export const PUT = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.members.manage')
  const body = updateSchema.parse(await request.json())
  if (!isPortalRole(body.role)) {
    throw new Error('Invalid portal role')
  }
  const permissions = await updateTenantPortalRolePermissions(
    ctx.tenantId,
    body.role,
    body.permissions,
  )
  return jsonOk({ role: body.role, permissions })
}, 'v2/tenant/role-permissions')

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('tenant.members.manage')
  await seedTenantRolePermissions(ctx.tenantId)
  const roles = await listTenantPortalRoleMaps(ctx.tenantId)
  return jsonOk({ roles, message: 'Portal role defaults restored' })
}, 'v2/tenant/role-permissions')

import crypto from 'crypto'
import { queryOne, execute } from '@/lib/db'
import { createUser, getUserByEmail, type UserRole } from '@/lib/auth'
import { createTenantWithOwner, type BusinessType } from '@/lib/modules/tenant/onboarding'
import { logAudit } from '@/lib/audit'
import { ApiError, conflict } from '@/lib/api-handler'
import type { TenantPlan } from '@/lib/modules/platform/tenants-admin'
export interface ProvisionTenantInput {
  organizationName: string
  ownerEmail: string
  ownerFirstName?: string
  ownerLastName?: string
  plan?: TenantPlan
  businessType?: BusinessType
}

export interface ProvisionTenantResult {
  tenantId: string
  slug: string
  ownerUserId: string
  ownerCreated: boolean
  temporaryPassword?: string
}

function randomPassword(): string {
  return crypto.randomBytes(9).toString('base64url') + 'A1!'
}

export async function provisionTenant(
  input: ProvisionTenantInput,
  adminUserId: string,
): Promise<ProvisionTenantResult> {
  const orgName = input.organizationName.trim()
  const email = input.ownerEmail.trim().toLowerCase()
  if (!orgName || orgName.length < 2) {
    throw new ApiError('Organization name is required', 400, 'VALIDATION_ERROR')
  }
  if (!email.includes('@')) {
    throw new ApiError('Valid owner email is required', 400, 'VALIDATION_ERROR')
  }

  const businessType: BusinessType = input.businessType ?? 'cooperative'
  const plan: TenantPlan = input.plan ?? 'trial'

  let ownerUserId: string
  let ownerCreated = false
  let temporaryPassword: string | undefined

  const existing = await getUserByEmail(email)
  if (existing) {
    if (existing.role === 'super_admin') {
      throw conflict('Cannot assign a platform administrator as tenant owner')
    }
    const existingMember = await queryOne<{ tenant_id: string }>(
      `SELECT tenant_id FROM tenant_members WHERE user_id = ? AND status = 'active' LIMIT 1`,
      [existing.id],
    )
    if (existingMember) {
      throw conflict('Owner email already belongs to an active tenant')
    }
    ownerUserId = existing.id
  } else {
    temporaryPassword = randomPassword()
    const firstName = input.ownerFirstName?.trim() || email.split('@')[0] || 'Owner'
    const lastName = input.ownerLastName?.trim() || 'User'
    const user = await createUser({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      role: 'boat_owner' as UserRole,
      initialStatus: 'active',
    })
    ownerUserId = user.id
    ownerCreated = true
  }

  const { tenantId, slug } = await createTenantWithOwner(
    ownerUserId,
    orgName,
    businessType,
  )

  if (plan !== 'trial') {
    await execute(`UPDATE tenants SET plan = ? WHERE id = ?`, [plan, tenantId])
  }

  await logAudit({
    userId: adminUserId,
    tenantId,
    action: 'platform.tenant.provision',
    resourceType: 'tenant',
    resourceId: tenantId,
    metadata: { slug, ownerEmail: email, ownerCreated, plan },
  })

  return {
    tenantId,
    slug,
    ownerUserId,
    ownerCreated,
    temporaryPassword,
  }
}

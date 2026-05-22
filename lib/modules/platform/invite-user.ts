import crypto from 'crypto'
import { queryOne, execute, generateId } from '@/lib/db'
import { createUser, getUserByEmail } from '@/lib/auth'
import type { TenantMemberRole } from '@/lib/tenant'
import { ApiError, conflict } from '@/lib/api-handler'

export interface InviteUserInput {
  tenantId: string
  email: string
  role: TenantMemberRole
  firstName?: string
  lastName?: string
}

export interface InviteUserResult {
  userId: string
  userCreated: boolean
  memberId: string
  temporaryPassword?: string
}

function randomPassword(): string {
  return crypto.randomBytes(9).toString('base64url') + 'A1!'
}

export async function inviteUserToTenant(input: InviteUserInput): Promise<InviteUserResult> {
  const email = input.email.trim().toLowerCase()
  if (!email.includes('@')) {
    throw new ApiError('Valid email is required', 400, 'VALIDATION_ERROR')
  }

  const tenant = await queryOne<{ id: string }>(`SELECT id FROM tenants WHERE id = ?`, [input.tenantId])
  if (!tenant) {
    throw new ApiError('Tenant not found', 404, 'NOT_FOUND')
  }

  const branch = await queryOne<{ id: string }>(
    `SELECT id FROM branches WHERE tenant_id = ? ORDER BY type = 'headquarters' DESC LIMIT 1`,
    [input.tenantId],
  )

  let userId: string
  let userCreated = false
  let temporaryPassword: string | undefined

  const existing = await getUserByEmail(email)
  if (existing) {
    if (existing.role === 'super_admin') {
      throw conflict('Cannot invite a platform administrator')
    }
    userId = existing.id
  } else {
    temporaryPassword = randomPassword()
    const firstName = input.firstName?.trim() || email.split('@')[0] || 'User'
    const lastName = input.lastName?.trim() || 'Member'
    const user = await createUser({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      initialStatus: 'active',
    })
    userId = user.id
    userCreated = true
  }

  const existingMember = await queryOne<{ id: string }>(
    `SELECT id FROM tenant_members WHERE tenant_id = ? AND user_id = ?`,
    [input.tenantId, userId],
  )
  if (existingMember) {
    throw conflict('User is already a member of this tenant')
  }

  const memberId = generateId()
  await execute(
    `INSERT INTO tenant_members (id, tenant_id, user_id, branch_id, role, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [memberId, input.tenantId, userId, branch?.id ?? null, input.role],
  )

  return { userId, userCreated, memberId, temporaryPassword }
}

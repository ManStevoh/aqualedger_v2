import { execute, queryOne } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'
import { createUser, getUserByEmail } from '@/lib/auth'
import { ensureTenantMember } from '@/lib/modules/tenant/portal-members'

export interface InviteClientInput {
  email: string
  firstName: string
  lastName: string
  phone?: string
  password?: string
  customerId?: string
}

export async function inviteClientPortalUser(
  tenantId: string,
  input: InviteClientInput,
): Promise<{ userId: string; memberId: string; customerId: string | null; createdUser: boolean }> {
  const email = input.email.trim().toLowerCase()
  let userId: string
  let createdUser = false

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    userId = existingUser.id
    if (existingUser.status !== 'active') {
      throw conflict('User account exists but is not active')
    }
  } else {
    if (!input.password || input.password.length < 8) {
      throw conflict('Password (min 8 characters) required for new client accounts')
    }
    const user = await createUser({
      email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'fish_buyer',
      initialStatus: 'active',
    })
    userId = user.id
    createdUser = true
  }

  const { memberId } = await ensureTenantMember(tenantId, userId, 'customer')

  let customerId: string | null = input.customerId ?? null

  if (customerId) {
    const row = await queryOne<{ id: string }>(
      `SELECT id FROM crm_customers WHERE id = ? AND tenant_id = ?`,
      [customerId, tenantId],
    )
    if (!row) throw notFound('CRM customer not found')
    await execute(
      `UPDATE crm_customers SET user_id = ?, email = COALESCE(email, ?) WHERE id = ?`,
      [userId, email, customerId],
    )
  } else {
    const byEmail = await queryOne<{ id: string }>(
      `SELECT id FROM crm_customers WHERE tenant_id = ? AND email = ? LIMIT 1`,
      [tenantId, email],
    )
    if (byEmail) {
      customerId = byEmail.id
      await execute(`UPDATE crm_customers SET user_id = ? WHERE id = ?`, [userId, customerId])
    }
  }

  return { userId, memberId, customerId, createdUser }
}

export async function linkCustomerToPortalUser(
  tenantId: string,
  customerId: string,
  userId: string,
): Promise<void> {
  const customer = await queryOne<{ id: string }>(
    `SELECT id FROM crm_customers WHERE id = ? AND tenant_id = ?`,
    [customerId, tenantId],
  )
  if (!customer) throw notFound('Customer not found')

  await ensureTenantMember(tenantId, userId, 'customer')
  await execute(`UPDATE crm_customers SET user_id = ? WHERE id = ?`, [userId, customerId])
}

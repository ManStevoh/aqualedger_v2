import { execute, generateId, queryOne } from '@/lib/db'
import { conflict, notFound } from '@/lib/api-handler'
import { createUser, getUserByEmail } from '@/lib/auth'
import { ensureTenantMember } from '@/lib/modules/tenant/portal-members'

export interface InviteVendorInput {
  email: string
  firstName: string
  lastName: string
  shopName: string
  commissionRate?: number
  password?: string
  phone?: string
}

export async function inviteMarketplaceVendor(
  tenantId: string,
  input: InviteVendorInput,
): Promise<{ vendorId: string; userId: string; memberId: string; createdUser: boolean }> {
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
      throw conflict('Password (min 8 characters) required for new vendor accounts')
    }
    const user = await createUser({
      email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'user',
      initialStatus: 'active',
    })
    userId = user.id
    createdUser = true
  }

  const { memberId } = await ensureTenantMember(tenantId, userId, 'vendor')

  const existingVendor = await queryOne<{ id: string }>(
    `SELECT id FROM marketplace_vendors WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, userId],
  )
  if (existingVendor) {
    await execute(
      `UPDATE marketplace_vendors SET shop_name = ?, commission_rate = ?, status = 'active' WHERE id = ?`,
      [input.shopName, input.commissionRate ?? 10, existingVendor.id],
    )
    return {
      vendorId: existingVendor.id,
      userId,
      memberId,
      createdUser,
    }
  }

  const vendorId = generateId()
  await execute(
    `INSERT INTO marketplace_vendors (id, tenant_id, user_id, shop_name, commission_rate, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [vendorId, tenantId, userId, input.shopName, input.commissionRate ?? 10],
  )

  return { vendorId, userId, memberId, createdUser }
}

export async function linkExistingUserAsVendor(
  tenantId: string,
  userId: string,
  shopName: string,
  commissionRate = 10,
): Promise<string> {
  const user = await queryOne<{ id: string }>(`SELECT id FROM users WHERE id = ?`, [userId])
  if (!user) throw notFound('User not found')

  await ensureTenantMember(tenantId, userId, 'vendor')

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM marketplace_vendors WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, userId],
  )
  if (existing) return existing.id

  const vendorId = generateId()
  await execute(
    `INSERT INTO marketplace_vendors (id, tenant_id, user_id, shop_name, commission_rate, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [vendorId, tenantId, userId, shopName, commissionRate],
  )
  return vendorId
}

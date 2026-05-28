import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookies, getUserById } from '@/lib/auth'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { queryOne } from '@/lib/db'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const auth = await getAuthFromCookies()
  if (!auth) {
    return jsonOk({ authenticated: false, user: null })
  }

  // Verify that they are a member of this specific tenant
  const member = await queryOne<{ role: string; status: string }>(
    `SELECT role, status FROM tenant_members
     WHERE tenant_id = ? AND user_id = ?`,
    [tenantId, auth.userId],
  )

  if (!member || member.status !== 'active') {
    // Isolated: authenticated globally but not for this specific tenant's storefront
    return jsonOk({ authenticated: false, user: null, globalUser: auth.email })
  }

  const user = await getUserById(auth.userId)
  if (!user || user.status !== 'active') {
    return jsonOk({ authenticated: false, user: null })
  }

  return jsonOk({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: member.role,
    },
  })
}, 'public/store/auth/me')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { listGuestOrders } from '@/lib/modules/commerce/customer-portal'
import { getAuthFromCookies } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

const querySchema = z.object({
  email: z.string().email().optional().nullable(),
  token: z.string().optional(),
})

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')

  const auth = await getAuthFromCookies()
  if (auth) {
    const member = await queryOne<{ role: string; status: string }>(
      `SELECT role, status FROM tenant_members
       WHERE tenant_id = ? AND user_id = ? AND status = 'active'`,
      [tenantId, auth.userId],
    )
    if (member) {
      const orders = await query(
        `SELECT o.id, o.order_number, o.status, o.total, o.payment_status, o.created_at, o.delivery_address
         FROM orders o
         WHERE o.tenant_id = ? AND (o.buyer_id = ? OR o.guest_email = ?)
         ORDER BY o.created_at DESC LIMIT 50`,
        [tenantId, auth.userId, auth.email.toLowerCase()],
      )
      return jsonOk({ orders })
    }
  }

  const { searchParams } = new URL(request.url)
  const emailParam = searchParams.get('email')
  if (!emailParam) {
    return jsonOk({ orders: [] })
  }

  const input = querySchema.parse({
    email: emailParam,
    token: searchParams.get('token') ?? undefined,
  })

  const orders = await listGuestOrders(tenantId, input.email || '', input.token)
  return jsonOk({ orders })
}, 'public/store/orders')

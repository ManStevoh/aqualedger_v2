import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { listGuestOrders } from '@/lib/modules/commerce/customer-portal'

const querySchema = z.object({
  email: z.string().email(),
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

  const { searchParams } = new URL(request.url)
  const input = querySchema.parse({
    email: searchParams.get('email'),
    token: searchParams.get('token') ?? undefined,
  })

  const orders = await listGuestOrders(tenantId, input.email, input.token)
  return jsonOk({ orders })
}, 'public/store/orders')

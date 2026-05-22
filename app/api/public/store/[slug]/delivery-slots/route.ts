import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { resolveTenantIdBySlug } from '@/lib/modules/commerce/guest-cart'
import { listDeliverySlots } from '@/lib/modules/commerce/delivery-slots'

export const GET = apiHandler(async (
  _request,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { slug } = await (context?.params ?? Promise.resolve({ slug: '' }))
  if (!slug) throw notFound('Store not found')
  const tenantId = await resolveTenantIdBySlug(slug)
  if (!tenantId) throw notFound('Store not found')
  const slots = await listDeliverySlots(tenantId, undefined, 7)
  const open = slots.filter((s) => s.status === 'open' || s.status === 'full')
  return jsonOk({ slots: open })
}, 'public/store/delivery-slots')

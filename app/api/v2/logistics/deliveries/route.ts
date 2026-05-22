import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listDeliveries, createDelivery } from '@/lib/modules/logistics/service'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
})

const createDeliverySchema = z.object({
  orderId: z.string().uuid().optional(),
  deliveryAddress: z.string().min(1),
  pickupAddress: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('logistics.deliveries.read')
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  const { deliveries, total } = await listDeliveries(
    ctx.tenantId,
    parsed.page,
    parsed.limit,
    parsed.status,
  )

  return jsonOk({
    deliveries,
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit) || 1,
    },
  })
}, 'v2/logistics/deliveries')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('logistics.deliveries.write')
  const body = await request.json()
  const input = createDeliverySchema.parse(body)
  const delivery = await createDelivery(ctx.tenantId, input)
  return jsonOk({ delivery }, 201)
}, 'v2/logistics/deliveries')

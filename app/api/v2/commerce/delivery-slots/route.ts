import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listDeliverySlots, createDeliverySlot } from '@/lib/modules/commerce/delivery-slots'

const createSchema = z.object({
  slotDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  maxOrders: z.number().int().positive().optional(),
  coldChain: z.boolean().optional(),
  zoneLabel: z.string().optional().nullable(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.orders.read')
  const days = Number(new URL(request.url).searchParams.get('days') || 14)
  const slots = await listDeliverySlots(ctx.tenantId, undefined, days)
  return jsonOk({ slots })
}, 'v2/commerce/delivery-slots')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('commerce.orders.write')
  const body = createSchema.parse(await request.json())
  const slot = await createDeliverySlot(ctx.tenantId, body)
  return jsonOk({ slot }, 201)
}, 'v2/commerce/delivery-slots')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  getDelivery,
  listDeliveryEvents,
  updateDeliveryStatus,
  type DeliveryStatus,
} from '@/lib/modules/logistics/service'

const patchSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled']).optional(),
  location: z.string().max(255).optional(),
  proofUrl: z.string().max(500).optional(),
  proofNotes: z.string().max(500).optional(),
  proofUpload: z.object({
    fileName: z.string().min(1).max(255),
    mimeType: z.string().max(100).optional(),
    dataUrl: z.string().max(500000).optional(),
  }).optional(),
}).refine(
  (data) =>
    data.status !== undefined ||
    data.proofUrl !== undefined ||
    data.proofUpload !== undefined ||
    data.proofNotes !== undefined ||
    data.location !== undefined,
  { message: 'At least one field must be provided' },
)

export const GET = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('logistics.deliveries.read')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))

  const delivery = await getDelivery(ctx.tenantId, id)
  if (!delivery) {
    throw notFound('Delivery not found')
  }

  const events = await listDeliveryEvents(id)
  return jsonOk({ delivery, events })
}, 'v2/logistics/deliveries/[id]')

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('logistics.deliveries.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = await request.json()
  const input = patchSchema.parse(body)

  const result = await updateDeliveryStatus(ctx.tenantId, id, {
    status: input.status as DeliveryStatus | undefined,
    location: input.location,
    proofUrl: input.proofUrl,
    proofNotes: input.proofNotes,
    proofUpload: input.proofUpload,
  })

  return jsonOk(result)
}, 'v2/logistics/deliveries/[id]')

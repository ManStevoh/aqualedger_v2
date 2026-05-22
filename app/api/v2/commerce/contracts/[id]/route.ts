import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  recordContractFulfillment,
  updateSalesContractStatus,
} from '@/lib/modules/commerce/sales-contracts'

const fulfillSchema = z.object({
  action: z.literal('fulfill'),
  quantityKg: z.number().positive(),
  tripId: z.string().uuid().optional().nullable(),
  orderId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
})

const statusSchema = z.object({
  action: z.literal('status'),
  status: z.enum(['draft', 'active', 'fulfilled', 'cancelled']),
})

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('commerce.contracts.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = z.union([fulfillSchema, statusSchema]).parse(await request.json())

  if (body.action === 'fulfill') {
    const contract = await recordContractFulfillment(ctx.tenantId, id, {
      quantityKg: body.quantityKg,
      tripId: body.tripId,
      orderId: body.orderId,
      notes: body.notes,
    })
    return jsonOk({ contract })
  }

  const contract = await updateSalesContractStatus(ctx.tenantId, id, body.status)
  return jsonOk({ contract })
}, 'v2/commerce/contracts/[id]')

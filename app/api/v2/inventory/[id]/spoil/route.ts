import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { markBatchSpoiled } from '@/lib/modules/inventory/service'

const spoilSchema = z.object({
  reason: z.string().max(500).optional(),
  quantityKg: z.coerce.number().min(0).optional(),
})

export const POST = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('inventory.batches.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = await request.json().catch(() => ({}))
  const input = spoilSchema.parse(body)

  const batch = await markBatchSpoiled(ctx.tenantId, id, input, ctx.userId)
  return jsonOk({ batch })
}, 'v2/inventory/[id]/spoil')

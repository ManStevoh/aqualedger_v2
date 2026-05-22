import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { purchaseRequestApproveSchema } from '@/lib/modules/procurement/schemas'
import { approvePurchaseRequest } from '@/lib/modules/procurement/service'

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('procurement.orders.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = purchaseRequestApproveSchema.parse(await request.json())
  const purchaseRequest = await approvePurchaseRequest(ctx.tenantId, id, body.status)
  return jsonOk({ purchaseRequest })
}, 'v2/procurement/requests/[id]')

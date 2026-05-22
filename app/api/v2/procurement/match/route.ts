import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  runThreeWayMatch,
  listMatchRecords,
  linkApInvoiceToPo,
} from '@/lib/modules/procurement/three-way-match'

const runSchema = z.object({ purchaseOrderId: z.string().uuid() })
const linkSchema = z.object({
  apInvoiceId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  grnId: z.string().uuid().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('procurement.orders.read')
  const matches = await listMatchRecords(ctx.tenantId)
  return jsonOk({ matches })
}, 'v2/procurement/match')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.orders.write')
  const body = await request.json()
  if (body.apInvoiceId) {
    const input = linkSchema.parse(body)
    const result = await linkApInvoiceToPo(
      ctx.tenantId,
      input.apInvoiceId,
      input.purchaseOrderId,
      input.grnId,
    )
    return jsonOk({ match: result })
  }
  const input = runSchema.parse(body)
  const result = await runThreeWayMatch(ctx.tenantId, input.purchaseOrderId)
  return jsonOk({ match: result })
}, 'v2/procurement/match')

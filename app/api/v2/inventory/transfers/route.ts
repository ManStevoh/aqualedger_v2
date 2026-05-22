import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  stockTransferCreateSchema,
  stockTransferListQuerySchema,
  stockTransferUpdateSchema,
} from '@/lib/modules/inventory/schemas'
import {
  listStockTransfers,
  createStockTransfer,
  updateStockTransferStatus,
} from '@/lib/modules/inventory/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.transfers.read')
  const { searchParams } = new URL(request.url)
  const query = stockTransferListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    fromLocation: searchParams.get('fromLocation') ?? undefined,
    toLocation: searchParams.get('toLocation') ?? undefined,
  })

  const data = await listStockTransfers(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/inventory/transfers')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.transfers.write')
  const body = await request.json()
  if (body.id && body.status) {
    const parsed = stockTransferUpdateSchema.parse(body)
    const transfer = await updateStockTransferStatus(ctx.tenantId, parsed)
    return jsonOk({ transfer })
  }
  const parsed = stockTransferCreateSchema.parse(body)
  const transfer = await createStockTransfer(ctx.tenantId, parsed, ctx.userId)
  return jsonOk({ transfer }, 201)
}, 'v2/inventory/transfers')

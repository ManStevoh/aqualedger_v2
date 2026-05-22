import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  inventoryMovementCreateSchema,
  inventoryMovementListQuerySchema,
} from '@/lib/modules/inventory/schemas'
import {
  listInventoryMovements,
  recordInventoryMovement,
} from '@/lib/modules/inventory/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.batches.read')
  const { searchParams } = new URL(request.url)
  const query = inventoryMovementListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    batchId: searchParams.get('batchId') ?? undefined,
    movementType: searchParams.get('movementType') ?? undefined,
  })

  const data = await listInventoryMovements(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/inventory/movements')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.batches.write')
  const body = inventoryMovementCreateSchema.parse(await request.json())
  const movement = await recordInventoryMovement(ctx.tenantId, body, ctx.userId)
  return jsonOk({ movement }, 201)
}, 'v2/inventory/movements')

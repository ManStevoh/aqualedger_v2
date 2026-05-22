import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  createInventoryBatch,
  listInventoryBatches,
  type InventoryBatchStatus,
  type InventoryStorageType,
} from '@/lib/modules/inventory/service'
import { inventoryBatchCreateSchema } from '@/lib/validation/schemas'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.batches.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const status = searchParams.get('status') as InventoryBatchStatus | null
  const sku = searchParams.get('sku')
  const storageType = searchParams.get('storageType') as InventoryStorageType | null

  const data = await listInventoryBatches({
    tenantId: ctx.tenantId,
    page,
    limit,
    status: status || undefined,
    sku: sku || undefined,
    storageType: storageType || undefined,
  })

  return jsonOk(data)
}, 'v2/inventory')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.batches.write')
  const body = await request.json()
  const parsed = inventoryBatchCreateSchema.parse(body)

  const batch = await createInventoryBatch(ctx.tenantId, parsed)
  return jsonOk({ batch }, 201)
}, 'v2/inventory')

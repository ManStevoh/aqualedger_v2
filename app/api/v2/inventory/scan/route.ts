import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

const bodySchema = z.object({
  barcode: z.string().min(1).max(128),
  action: z.enum(['lookup', 'receive', 'transfer', 'ship']).default('lookup'),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('inventory.stock.read')
  const body = bodySchema.parse(await request.json())

  const batch = await queryOne<Record<string, unknown>>(
    `SELECT * FROM inventory_batches
     WHERE ${tenantWhere()} AND (batch_code = ? OR sku = ?)
     LIMIT 1`,
    [ctx.tenantId, body.barcode, body.barcode],
  )

  const scanId = generateId()
  await execute(
    `INSERT INTO inventory_barcode_scans (id, tenant_id, user_id, barcode, batch_id, sku, action, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scanId,
      ctx.tenantId,
      ctx.userId,
      body.barcode,
      batch?.id ?? null,
      batch?.sku ?? body.barcode,
      body.action,
      JSON.stringify({ found: Boolean(batch) }),
    ],
  )

  return jsonOk({ scanId, batch: batch ?? null, found: Boolean(batch) })
}, 'v2/inventory/scan')

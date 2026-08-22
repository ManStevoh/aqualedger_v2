import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { resolveTenantId, tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type {
  InventoryMovementCreateInput,
  TraceabilityLotCreateInput,
  StockTransferCreateInput,
  StockTransferUpdateInput,
} from './schemas'

export type InventoryBatchStatus = 'available' | 'reserved' | 'depleted' | 'spoiled'
export type InventoryStorageType = 'fresh' | 'frozen' | 'dried'
export type InventorySourceType = 'catch' | 'purchase' | 'transfer' | 'adjustment'

export interface InventoryBatch {
  id: string
  tenant_id: string
  sku: string
  product_name: string
  species_id: string | null
  batch_code: string
  quantity_kg: number
  reserved_kg: number
  storage_type: InventoryStorageType
  expiry_date: string | null
  source_type: InventorySourceType
  source_id: string | null
  status: InventoryBatchStatus
  created_at: string
  updated_at: string
  species_name?: string | null
}

export interface ListInventoryBatchesOptions {
  tenantId: string
  page?: number
  limit?: number
  status?: InventoryBatchStatus
  sku?: string
  storageType?: InventoryStorageType
}

export interface CreateInventoryBatchInput {
  sku: string
  productName: string
  batchCode: string
  quantityKg: number
  speciesId?: string | null
  storageType?: InventoryStorageType
  expiryDate?: string | null
  sourceType?: InventorySourceType
  sourceId?: string | null
  status?: InventoryBatchStatus
}

export async function listInventoryBatches(options: ListInventoryBatchesOptions) {
  const page = options.page ?? 1
  const limit = Math.min(options.limit ?? 20, 100)
  const pagination = buildPagination(page, limit)

  const conditions: string[] = [tenantWhere('ib')]
  const params: unknown[] = [options.tenantId]

  if (options.status) {
    conditions.push('ib.status = ?')
    params.push(options.status)
  }
  if (options.sku) {
    conditions.push('ib.sku = ?')
    params.push(options.sku)
  }
  if (options.storageType) {
    conditions.push('ib.storage_type = ?')
    params.push(options.storageType)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM inventory_batches ib ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const batches = await query<InventoryBatch>(
    `SELECT ib.*, fs.name as species_name
     FROM inventory_batches ib
     LEFT JOIN fish_species fs ON ib.species_id = fs.id
     ${where}
     ORDER BY
       CASE WHEN ib.expiry_date IS NULL THEN 1 ELSE 0 END,
       ib.expiry_date ASC,
       ib.created_at DESC
     ${pagination.clause}`,
    params,
  )

  const [summary] = await query<{
    total_batches: number
    total_quantity_kg: number
    total_reserved_kg: number
    available_batches: number
  }>(
    `SELECT
       COUNT(*) as total_batches,
       COALESCE(SUM(quantity_kg), 0) as total_quantity_kg,
       COALESCE(SUM(reserved_kg), 0) as total_reserved_kg,
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_batches
     FROM inventory_batches ib
     ${where}`,
    params,
  )

  return {
    batches,
    summary: summary ?? {
      total_batches: 0,
      total_quantity_kg: 0,
      total_reserved_kg: 0,
      available_batches: 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function createInventoryBatch(
  tenantId: string,
  input: CreateInventoryBatchInput,
): Promise<InventoryBatch> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM inventory_batches WHERE tenant_id = ? AND batch_code = ?`,
    [tenantId, input.batchCode],
  )
  if (existing) {
    throw conflict('Batch code already exists for this tenant')
  }

  if (input.speciesId) {
    const species = await queryOne<{ id: string }>(
      'SELECT id FROM fish_species WHERE id = ?',
      [input.speciesId],
    )
    if (!species) {
      throw notFound('Fish species not found')
    }
  }

  const id = generateId()
  await execute(
    `INSERT INTO inventory_batches (
      id, tenant_id, sku, product_name, species_id, batch_code,
      quantity_kg, reserved_kg, storage_type, expiry_date,
      source_type, source_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.sku,
      input.productName,
      input.speciesId ?? null,
      input.batchCode,
      input.quantityKg,
      input.storageType ?? 'fresh',
      input.expiryDate ?? null,
      input.sourceType ?? 'catch',
      input.sourceId ?? null,
      input.status ?? 'available',
    ],
  )

  const batch = await queryOne<InventoryBatch>(
    `SELECT ib.*, fs.name as species_name
     FROM inventory_batches ib
     LEFT JOIN fish_species fs ON ib.species_id = fs.id
     WHERE ib.id = ?`,
    [id],
  )

  if (!batch) {
    throw new Error('Failed to create inventory batch')
  }

  return batch
}

export interface InventoryMovement {
  id: string
  tenant_id: string
  batch_id: string | null
  movement_type: string
  quantity_kg: number
  from_location: string | null
  to_location: string | null
  reference_type: string | null
  reference_id: string | null
  lot_code: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface TraceabilityLot {
  id: string
  tenant_id: string
  lot_code: string
  catch_id: string | null
  species_name: string | null
  vessel_name: string | null
  landing_site: string | null
  catch_date: string | null
  grading: string | null
  msc_certified: number
  fao_area: string | null
  storage_temp_c: number | null
  status: string
  created_at: string
}

export async function listInventoryMovements(
  tenantId: string,
  opts: { batchId?: string; movementType?: string; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 20, 100)
  const pagination = buildPagination(page, limit)
  const conditions: string[] = [tenantWhere('im')]
  const params: unknown[] = [tenantId]

  if (opts.batchId) {
    conditions.push('im.batch_id = ?')
    params.push(opts.batchId)
  }
  if (opts.movementType) {
    conditions.push('im.movement_type = ?')
    params.push(opts.movementType)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM inventory_movements im ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const movements = await query<InventoryMovement>(
    `SELECT im.* FROM inventory_movements im ${where} ORDER BY im.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    movements,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function recordInventoryMovement(
  tenantId: string,
  input: InventoryMovementCreateInput,
  createdBy?: string,
): Promise<InventoryMovement> {
  if (input.batchId) {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM inventory_batches WHERE id = ? AND tenant_id = ?`,
      [input.batchId, tenantId],
    )
    if (!batch) {
      throw notFound('Inventory batch not found')
    }
  }

  const id = generateId()
  await execute(
    `INSERT INTO inventory_movements (
      id, tenant_id, batch_id, movement_type, quantity_kg,
      from_location, to_location, reference_type, reference_id,
      lot_code, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.batchId ?? null,
      input.movementType,
      input.quantityKg,
      input.fromLocation ?? null,
      input.toLocation ?? null,
      input.referenceType ?? null,
      input.referenceId ?? null,
      input.lotCode ?? null,
      input.notes ?? null,
      createdBy ?? null,
    ],
  )

  const movement = await queryOne<InventoryMovement>(
    'SELECT * FROM inventory_movements WHERE id = ?',
    [id],
  )
  if (!movement) throw new Error('Failed to record movement')
  return movement
}

export async function listTraceabilityLots(
  tenantId: string,
  opts: { status?: string; lotCode?: string; page?: number; limit?: number } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 20, 100)
  const pagination = buildPagination(page, limit)
  const conditions: string[] = [tenantWhere('tl')]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('tl.status = ?')
    params.push(opts.status)
  }
  if (opts.lotCode) {
    conditions.push('tl.lot_code LIKE ?')
    params.push(`%${opts.lotCode}%`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM traceability_lots tl ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const lots = await query<TraceabilityLot>(
    `SELECT tl.* FROM traceability_lots tl ${where} ORDER BY tl.created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    lots,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createTraceabilityLot(
  tenantId: string,
  input: TraceabilityLotCreateInput,
): Promise<TraceabilityLot> {
  const tid = resolveTenantId(tenantId)
  let lotCode = input.lotCode
  let speciesName = input.speciesName
  let vesselName = input.vesselName
  let landingSite = input.landingSite
  let catchDate = input.catchDate
  let grading = input.grading

  if (input.catchId) {
    const catchRow = await queryOne<{
      id: string
      grade: string
      quantity_kg: number
      created_at: string | Date
      species_name: string
      vessel_name: string | null
      landing_site_name: string | null
    }>(
      `SELECT c.id, c.grade, c.quantity_kg, c.created_at,
              fs.name as species_name, b.name as vessel_name, ls.name as landing_site_name
       FROM catches c
       JOIN fish_species fs ON c.species_id = fs.id
       JOIN fishing_trips ft ON c.trip_id = ft.id
       JOIN boats b ON ft.boat_id = b.id
       LEFT JOIN landing_sites ls ON ft.landing_site_id = ls.id
       WHERE c.id = ?`,
      [input.catchId],
    )
    if (!catchRow) {
      throw notFound('Catch not found')
    }
    speciesName = speciesName ?? catchRow.species_name
    vesselName = vesselName ?? catchRow.vessel_name
    landingSite = landingSite ?? catchRow.landing_site_name
    const formattedCatchDate =
      catchRow.created_at instanceof Date
        ? catchRow.created_at.toISOString().split('T')[0]
        : String(catchRow.created_at).split('T')[0].split(' ')[0]
    catchDate = catchDate ?? formattedCatchDate
    grading = (grading ?? catchRow.grade) as TraceabilityLotCreateInput['grading']
    if (!lotCode) {
      lotCode = `LOT-${catchRow.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    }
  }

  lotCode = lotCode || `LOT-${Date.now().toString(36).toUpperCase()}`

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM traceability_lots WHERE tenant_id = ? AND lot_code = ?`,
    [tid, lotCode],
  )
  if (existing) {
    throw conflict('Lot code already exists')
  }

  const id = generateId()
  await execute(
    `INSERT INTO traceability_lots (
      id, tenant_id, lot_code, catch_id, species_name, vessel_name,
      landing_site, catch_date, grading, msc_certified, fao_area, storage_temp_c
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      lotCode,
      input.catchId ?? null,
      speciesName ?? null,
      vesselName ?? null,
      landingSite ?? null,
      catchDate ?? null,
      grading ?? null,
      input.mscCertified ? 1 : 0,
      input.faoArea ?? null,
      input.storageTempC ?? null,
    ],
  )

  if (input.batchId) {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM inventory_batches WHERE id = ? AND tenant_id = ?`,
      [input.batchId, tid],
    )
    if (!batch) {
      throw notFound('Inventory batch not found')
    }
    await execute(
      `UPDATE inventory_batches SET batch_code = ?, updated_at = NOW() WHERE id = ?`,
      [lotCode, input.batchId],
    )
  }

  const lot = await queryOne<TraceabilityLot>(
    'SELECT * FROM traceability_lots WHERE id = ?',
    [id],
  )
  if (!lot) throw new Error('Failed to create traceability lot')
  return lot
}

export interface MarkBatchSpoiledInput {
  reason?: string
  quantityKg?: number
}

export async function markBatchSpoiled(
  tenantId: string,
  batchId: string,
  input: MarkBatchSpoiledInput = {},
  createdBy?: string,
): Promise<InventoryBatch> {
  const batch = await queryOne<InventoryBatch>(
    `SELECT * FROM inventory_batches WHERE id = ? AND ${tenantWhere()}`,
    [batchId, tenantId],
  )
  if (!batch) {
    throw notFound('Inventory batch not found')
  }
  if (batch.status === 'spoiled') {
    throw conflict('Batch is already marked as spoiled')
  }
  if (batch.status === 'depleted') {
    throw conflict('Cannot spoil a depleted batch')
  }

  const spoilQty = input.quantityKg ?? batch.quantity_kg

  await execute(
    `UPDATE inventory_batches SET status = 'spoiled', quantity_kg = 0, updated_at = NOW()
     WHERE id = ? AND ${tenantWhere()}`,
    [batchId, tenantId],
  )

  await execute(
    `INSERT INTO inventory_movements (
      id, tenant_id, batch_id, movement_type, quantity_kg, notes, created_by
    ) VALUES (?, ?, ?, 'spoilage', ?, ?, ?)`,
    [
      generateId(),
      tenantId,
      batchId,
      spoilQty,
      input.reason ?? 'Batch marked as spoiled',
      createdBy ?? null,
    ],
  )

  const updated = await queryOne<InventoryBatch>(
    `SELECT ib.*, fs.name as species_name
     FROM inventory_batches ib
     LEFT JOIN fish_species fs ON ib.species_id = fs.id
     WHERE ib.id = ?`,
    [batchId],
  )
  if (!updated) {
    throw new Error('Failed to mark batch as spoiled')
  }
  return updated
}

export function getExpiringBatches(batches: InventoryBatch[], withinDays = 7) {
  const now = new Date()
  const threshold = new Date(now)
  threshold.setDate(threshold.getDate() + withinDays)

  return batches.filter((b) => {
    if (!b.expiry_date || b.status !== 'available') return false
    const expiry = new Date(b.expiry_date)
    return expiry <= threshold
  })
}

export type StockTransferStatus = 'draft' | 'in_transit' | 'received' | 'cancelled'

export interface StockTransfer {
  id: string
  tenant_id: string
  transfer_number: string
  from_location: string
  to_location: string
  batch_id: string | null
  quantity_kg: number
  status: StockTransferStatus
  created_by: string | null
  created_at: string
  batch_code?: string | null
}

function nextTransferNumber(tenantId: string): string {
  const suffix = Date.now().toString(36).toUpperCase()
  return `TR-${tenantId.slice(0, 4).toUpperCase()}-${suffix}`
}

export async function listStockTransfers(
  tenantId: string,
  opts: {
    page?: number
    limit?: number
    status?: StockTransferStatus
    fromLocation?: string
    toLocation?: string
  } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('st')]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('st.status = ?')
    params.push(opts.status)
  }
  if (opts.fromLocation) {
    conditions.push('st.from_location LIKE ?')
    params.push(`%${opts.fromLocation}%`)
  }
  if (opts.toLocation) {
    conditions.push('st.to_location LIKE ?')
    params.push(`%${opts.toLocation}%`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM stock_transfers st ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const transfers = await query<StockTransfer>(
    `SELECT st.*, ib.batch_code
     FROM stock_transfers st
     LEFT JOIN inventory_batches ib ON st.batch_id = ib.id
     ${where}
     ORDER BY st.created_at DESC
     ${pagination.clause}`,
    params,
  )

  return {
    transfers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createStockTransfer(
  tenantId: string,
  input: StockTransferCreateInput,
  createdBy?: string,
): Promise<StockTransfer> {
  if (input.batchId) {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM inventory_batches WHERE id = ? AND tenant_id = ?`,
      [input.batchId, tenantId],
    )
    if (!batch) throw notFound('Inventory batch not found')
  }

  const id = generateId()
  let transferNumber = nextTransferNumber(tenantId)

  for (let attempt = 0; attempt < 3; attempt++) {
    const dup = await queryOne<{ id: string }>(
      `SELECT id FROM stock_transfers WHERE tenant_id = ? AND transfer_number = ?`,
      [tenantId, transferNumber],
    )
    if (!dup) break
    transferNumber = nextTransferNumber(tenantId)
  }

  await execute(
    `INSERT INTO stock_transfers (
      id, tenant_id, transfer_number, from_location, to_location,
      batch_id, quantity_kg, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      transferNumber,
      input.fromLocation,
      input.toLocation,
      input.batchId ?? null,
      input.quantityKg,
      input.status ?? 'draft',
      createdBy ?? null,
    ],
  )

  const transfer = await queryOne<StockTransfer>(
    `SELECT st.*, ib.batch_code
     FROM stock_transfers st
     LEFT JOIN inventory_batches ib ON st.batch_id = ib.id
     WHERE st.id = ?`,
    [id],
  )
  if (!transfer) throw new Error('Failed to create stock transfer')
  return transfer
}

export async function updateStockTransferStatus(
  tenantId: string,
  input: StockTransferUpdateInput,
): Promise<StockTransfer> {
  const existing = await queryOne<StockTransfer>(
    `SELECT * FROM stock_transfers WHERE id = ? AND ${tenantWhere()}`,
    [input.id, tenantId],
  )
  if (!existing) throw notFound('Stock transfer not found')

  if (existing.status === 'cancelled' || existing.status === 'received') {
    throw conflict('Transfer cannot be updated in current status')
  }

  await execute(
    `UPDATE stock_transfers SET status = ? WHERE id = ? AND tenant_id = ?`,
    [input.status, input.id, tenantId],
  )

  if (input.status === 'received' && existing.batch_id) {
    await recordInventoryMovement(
      tenantId,
      {
        batchId: existing.batch_id,
        movementType: 'transfer',
        quantityKg: existing.quantity_kg,
        fromLocation: existing.from_location,
        toLocation: existing.to_location,
        referenceType: 'stock_transfer',
        referenceId: existing.id,
        notes: `Transfer ${existing.transfer_number} received`,
      },
      existing.created_by ?? undefined,
    )
  }

  const transfer = await queryOne<StockTransfer>(
    `SELECT st.*, ib.batch_code
     FROM stock_transfers st
     LEFT JOIN inventory_batches ib ON st.batch_id = ib.id
     WHERE st.id = ?`,
    [input.id],
  )
  if (!transfer) throw new Error('Failed to update stock transfer')
  return transfer
}

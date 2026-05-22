import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'
import type {
  BoatFuelLogCreateInput,
  FishingZoneCreateInput,
  FishingZoneUpdateInput,
} from './schemas'

export type FishAuctionStatus = 'scheduled' | 'live' | 'closed' | 'cancelled'

export interface FishAuction {
  id: string
  tenant_id: string
  landing_site_id: string | null
  lot_code: string | null
  species_name: string
  quantity_kg: number
  starting_price: number
  winning_price: number | null
  buyer_name: string | null
  status: FishAuctionStatus
  auction_date: string
  created_at: string
}

export interface CreateFishAuctionInput {
  landingSiteId?: string
  lotCode?: string
  speciesName: string
  quantityKg: number
  startingPrice: number
  auctionDate: string
  status?: FishAuctionStatus
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

export interface TraceabilityChain {
  lot: TraceabilityLot
  catch?: Record<string, unknown>
  trip?: Record<string, unknown>
  boat?: Record<string, unknown>
  auction?: FishAuction
  orders?: Record<string, unknown>[]
  deliveries?: Record<string, unknown>[]
  movements?: Record<string, unknown>[]
}

export async function listFishAuctions(
  tenantId: string,
  page = 1,
  limit = 50,
  status?: FishAuctionStatus,
): Promise<{ auctions: FishAuction[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM fish_auctions ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const auctions = await query<FishAuction>(
    `SELECT * FROM fish_auctions ${where}
     ORDER BY auction_date DESC
     ${pagination.clause}`,
    params,
  )

  return { auctions, total }
}

export async function createFishAuction(
  tenantId: string,
  input: CreateFishAuctionInput,
): Promise<FishAuction> {
  const id = generateId()

  await execute(
    `INSERT INTO fish_auctions
     (id, tenant_id, landing_site_id, lot_code, species_name, quantity_kg, starting_price, status, auction_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.landingSiteId ?? null,
      input.lotCode ?? null,
      input.speciesName,
      input.quantityKg,
      input.startingPrice,
      input.status ?? 'scheduled',
      input.auctionDate,
    ],
  )

  const auction = await queryOne<FishAuction>(
    `SELECT * FROM fish_auctions WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!auction) {
    throw new Error('Failed to create auction')
  }
  return auction
}

export async function getTraceabilityChain(
  tenantId: string,
  lotCode: string,
): Promise<TraceabilityChain> {
  const lot = await queryOne<TraceabilityLot>(
    `SELECT * FROM traceability_lots WHERE ${tenantWhere()} AND lot_code = ?`,
    [tenantId, lotCode],
  )
  if (!lot) {
    throw notFound('Traceability lot not found')
  }

  const chain: TraceabilityChain = { lot }

  if (lot.catch_id) {
    const catchRow = await queryOne<Record<string, unknown>>(
      `SELECT c.*, fs.name as species_name
       FROM catches c
       LEFT JOIN fish_species fs ON c.species_id = fs.id
       WHERE c.id = ?`,
      [lot.catch_id],
    )
    if (catchRow) {
      chain.catch = catchRow

      const trip = await queryOne<Record<string, unknown>>(
        `SELECT t.*, ls.name as landing_site_name
         FROM fishing_trips t
         LEFT JOIN landing_sites ls ON t.landing_site_id = ls.id
         WHERE t.id = ?`,
        [catchRow.trip_id],
      )
      if (trip) {
        chain.trip = trip

        const boat = await queryOne<Record<string, unknown>>(
          `SELECT b.*, CONCAT(u.first_name, ' ', u.last_name) as owner_name
           FROM boats b
           LEFT JOIN users u ON b.owner_id = u.id
           WHERE b.id = ?`,
          [trip.boat_id],
        )
        if (boat) {
          chain.boat = boat
        }
      }
    }
  }

  const auction = await queryOne<FishAuction>(
    `SELECT * FROM fish_auctions WHERE ${tenantWhere()} AND lot_code = ? ORDER BY auction_date DESC LIMIT 1`,
    [tenantId, lotCode],
  )
  if (auction) {
    chain.auction = auction
  }

  const movements = await query<Record<string, unknown>>(
    `SELECT * FROM inventory_movements WHERE ${tenantWhere()} AND lot_code = ? ORDER BY created_at ASC`,
    [tenantId, lotCode],
  )
  if (movements.length > 0) {
    chain.movements = movements
  }

  const orderIds = movements
    .filter((m) => m.reference_type === 'order' && m.reference_id)
    .map((m) => m.reference_id as string)

  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => '?').join(',')
    const orders = await query<Record<string, unknown>>(
      `SELECT * FROM orders WHERE id IN (${placeholders})`,
      orderIds,
    )
    if (orders.length > 0) {
      chain.orders = orders

      const deliveries = await query<Record<string, unknown>>(
        `SELECT * FROM deliveries WHERE ${tenantWhere()} AND order_id IN (${placeholders})`,
        [tenantId, ...orderIds],
      )
      if (deliveries.length > 0) {
        chain.deliveries = deliveries
      }
    }
  }

  return chain
}

export type FishingZoneStatus = 'open' | 'restricted' | 'closed'

export interface FishingZone {
  id: string
  tenant_id: string
  code: string
  name: string
  fao_area: string | null
  county: string | null
  status: FishingZoneStatus
}

export interface BoatFuelLog {
  id: string
  tenant_id: string
  boat_id: string
  trip_id: string | null
  liters: number
  cost: number
  logged_at: string
  notes: string | null
  created_at: string
  boat_name?: string | null
}

export async function listFishingZones(
  tenantId: string,
  opts: { page?: number; limit?: number; status?: FishingZoneStatus; code?: string } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('fz')]
  const params: unknown[] = [tenantId]

  if (opts.status) {
    conditions.push('fz.status = ?')
    params.push(opts.status)
  }
  if (opts.code) {
    conditions.push('fz.code LIKE ?')
    params.push(`%${opts.code}%`)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM fishing_zones fz ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const zones = await query<FishingZone>(
    `SELECT fz.* FROM fishing_zones fz ${where} ORDER BY fz.code ASC ${pagination.clause}`,
    params,
  )

  return {
    zones,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createFishingZone(
  tenantId: string,
  input: FishingZoneCreateInput,
): Promise<FishingZone> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM fishing_zones WHERE tenant_id = ? AND code = ?`,
    [tenantId, input.code],
  )
  if (existing) throw conflict('Zone code already exists')

  const id = generateId()
  await execute(
    `INSERT INTO fishing_zones (id, tenant_id, code, name, fao_area, county, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.code,
      input.name,
      input.faoArea ?? null,
      input.county ?? null,
      input.status ?? 'open',
    ],
  )

  const zone = await queryOne<FishingZone>(
    `SELECT * FROM fishing_zones WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!zone) throw new Error('Failed to create fishing zone')
  return zone
}

export async function updateFishingZone(
  tenantId: string,
  input: FishingZoneUpdateInput,
): Promise<FishingZone> {
  const existing = await queryOne<FishingZone>(
    `SELECT * FROM fishing_zones WHERE id = ? AND ${tenantWhere()}`,
    [input.id, tenantId],
  )
  if (!existing) throw notFound('Fishing zone not found')

  if (input.code && input.code !== existing.code) {
    const dup = await queryOne<{ id: string }>(
      `SELECT id FROM fishing_zones WHERE tenant_id = ? AND code = ? AND id != ?`,
      [tenantId, input.code, input.id],
    )
    if (dup) throw conflict('Zone code already exists')
  }

  await execute(
    `UPDATE fishing_zones SET
      code = COALESCE(?, code),
      name = COALESCE(?, name),
      fao_area = COALESCE(?, fao_area),
      county = COALESCE(?, county),
      status = COALESCE(?, status)
     WHERE id = ? AND tenant_id = ?`,
    [
      input.code ?? null,
      input.name ?? null,
      input.faoArea !== undefined ? input.faoArea : null,
      input.county !== undefined ? input.county : null,
      input.status ?? null,
      input.id,
      tenantId,
    ],
  )

  const zone = await queryOne<FishingZone>(
    `SELECT * FROM fishing_zones WHERE id = ?`,
    [input.id],
  )
  if (!zone) throw new Error('Failed to update fishing zone')
  return zone
}

export async function deleteFishingZone(tenantId: string, id: string): Promise<void> {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM fishing_zones WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!existing) throw notFound('Fishing zone not found')
  await execute(`DELETE FROM fishing_zones WHERE id = ? AND tenant_id = ?`, [id, tenantId])
}

export async function listBoatFuelLogs(
  tenantId: string,
  opts: { page?: number; limit?: number; boatId?: string; tripId?: string } = {},
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('fl')]
  const params: unknown[] = [tenantId]

  if (opts.boatId) {
    conditions.push('fl.boat_id = ?')
    params.push(opts.boatId)
  }
  if (opts.tripId) {
    conditions.push('fl.trip_id = ?')
    params.push(opts.tripId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM boat_fuel_logs fl ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const logs = await query<BoatFuelLog>(
    `SELECT fl.*, b.name as boat_name
     FROM boat_fuel_logs fl
     LEFT JOIN boats b ON fl.boat_id = b.id
     ${where}
     ORDER BY fl.logged_at DESC
     ${pagination.clause}`,
    params,
  )

  const [summary] = await query<{ total_liters: number; total_cost: number }>(
    `SELECT COALESCE(SUM(liters), 0) as total_liters, COALESCE(SUM(cost), 0) as total_cost
     FROM boat_fuel_logs fl ${where}`,
    params,
  )

  return {
    logs,
    summary: summary ?? { total_liters: 0, total_cost: 0 },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createBoatFuelLog(
  tenantId: string,
  input: BoatFuelLogCreateInput,
): Promise<BoatFuelLog> {
  const boat = await queryOne<{ id: string }>(
    `SELECT id FROM boats WHERE id = ? AND tenant_id = ?`,
    [input.boatId, tenantId],
  )
  if (!boat) throw notFound('Boat not found')

  if (input.tripId) {
    const trip = await queryOne<{ id: string }>(
      `SELECT id FROM fishing_trips WHERE id = ? AND tenant_id = ?`,
      [input.tripId, tenantId],
    )
    if (!trip) throw notFound('Trip not found')
  }

  const id = generateId()
  await execute(
    `INSERT INTO boat_fuel_logs (id, tenant_id, boat_id, trip_id, liters, cost, logged_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.boatId,
      input.tripId ?? null,
      input.liters,
      input.cost,
      input.loggedAt,
      input.notes ?? null,
    ],
  )

  const log = await queryOne<BoatFuelLog>(
    `SELECT fl.*, b.name as boat_name
     FROM boat_fuel_logs fl
     LEFT JOIN boats b ON fl.boat_id = b.id
     WHERE fl.id = ?`,
    [id],
  )
  if (!log) throw new Error('Failed to create fuel log')
  return log
}

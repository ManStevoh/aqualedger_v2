import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { conflict, notFound } from '@/lib/api-handler'

export interface DeliverySlotRow {
  id: string
  tenant_id: string
  slot_date: string
  start_time: string
  end_time: string
  max_orders: number
  booked_count: number
  cold_chain: number
  zone_label: string | null
  status: string
}

export async function listDeliverySlots(
  tenantId: string,
  fromDate?: string,
  days = 14,
): Promise<DeliverySlotRow[]> {
  const start = fromDate || new Date().toISOString().slice(0, 10)
  return query<DeliverySlotRow>(
    `SELECT * FROM delivery_slots
     WHERE ${tenantWhere()} AND slot_date >= ? AND slot_date <= DATE_ADD(?, INTERVAL ? DAY)
     ORDER BY slot_date ASC, start_time ASC`,
    [tenantId, start, start, days],
  )
}

export async function createDeliverySlot(
  tenantId: string,
  input: {
    slotDate: string
    startTime: string
    endTime: string
    maxOrders?: number
    coldChain?: boolean
    zoneLabel?: string | null
  },
): Promise<DeliverySlotRow> {
  const id = generateId()
  await execute(
    `INSERT INTO delivery_slots (id, tenant_id, slot_date, start_time, end_time, max_orders, cold_chain, zone_label)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.slotDate,
      input.startTime,
      input.endTime,
      input.maxOrders ?? 20,
      input.coldChain !== false ? 1 : 0,
      input.zoneLabel ?? null,
    ],
  )
  const row = await queryOne<DeliverySlotRow>(`SELECT * FROM delivery_slots WHERE id = ?`, [id])
  if (!row) throw new Error('Failed to create slot')
  return row
}

export async function bookDeliverySlot(tenantId: string, slotId: string): Promise<void> {
  const slot = await queryOne<DeliverySlotRow>(
    `SELECT * FROM delivery_slots WHERE id = ? AND ${tenantWhere()} FOR UPDATE`,
    [slotId, tenantId],
  )
  if (!slot) throw notFound('Delivery slot not found')
  if (slot.status === 'closed') throw conflict('Slot is closed')
  if (Number(slot.booked_count) >= Number(slot.max_orders)) {
    await execute(`UPDATE delivery_slots SET status = 'full' WHERE id = ?`, [slotId])
    throw conflict('Delivery slot is full')
  }
  const newCount = Number(slot.booked_count) + 1
  await execute(
    `UPDATE delivery_slots SET booked_count = ?, status = IF(? >= max_orders, 'full', status) WHERE id = ?`,
    [newCount, newCount, slotId],
  )
}

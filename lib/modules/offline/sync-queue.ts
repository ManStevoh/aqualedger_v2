import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function enqueueOfflineAction(
  tenantId: string,
  userId: string,
  deviceId: string,
  actionType: string,
  payload: Record<string, unknown>,
  clientTimestamp?: string,
) {
  const id = generateId()
  await execute(
    `INSERT INTO offline_sync_queue (id, tenant_id, user_id, device_id, action_type, payload, client_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, tenantId, userId, deviceId, actionType, JSON.stringify(payload), clientTimestamp ?? null],
  )
  return id
}

export async function processOfflineQueue(
  tenantId: string,
  userId: string,
  limit = 50,
): Promise<{ synced: number; failed: number }> {
  const rows = await query<{
    id: string
    action_type: string
    payload: string
  }>(
    `SELECT id, action_type, payload FROM offline_sync_queue
     WHERE ${tenantWhere()} AND user_id = ? AND status = 'pending'
     ORDER BY created_at ASC LIMIT ?`,
    [tenantId, userId, limit],
  )

  let synced = 0
  let failed = 0

  for (const row of rows) {
    try {
      const payload = JSON.parse(row.payload) as Record<string, unknown>
      await applyOfflineAction(tenantId, userId, row.action_type, payload)
      await execute(
        `UPDATE offline_sync_queue SET status = 'synced', synced_at = NOW() WHERE id = ?`,
        [row.id],
      )
      synced++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed'
      await execute(
        `UPDATE offline_sync_queue SET status = 'failed', error_message = ? WHERE id = ?`,
        [msg.slice(0, 500), row.id],
      )
      failed++
    }
  }

  return { synced, failed }
}

async function applyOfflineAction(
  tenantId: string,
  userId: string,
  actionType: string,
  payload: Record<string, unknown>,
) {
  switch (actionType) {
    case 'catch.log': {
      const tripId = String(payload.tripId || '')
      const speciesId = String(payload.speciesId || '')
      const qty = Number(payload.quantityKg || 0)
      if (!tripId || !speciesId || qty <= 0) throw new Error('Invalid catch payload')
      await execute(
        `INSERT INTO catches (id, trip_id, species_id, quantity_kg, grade, unit_price, total_value, storage_method, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          tripId,
          speciesId,
          qty,
          payload.grade || 'B',
          payload.unitPrice || 0,
          qty * Number(payload.unitPrice || 0),
          payload.storageMethod || 'fresh',
          userId,
        ],
      )
      break
    }
    case 'coldchain.reading': {
      const { recordTemperatureReading } = await import('@/lib/modules/coldchain/service')
      await recordTemperatureReading(tenantId, {
        zoneId: payload.zoneId ? String(payload.zoneId) : undefined,
        facilityId: payload.facilityId ? String(payload.facilityId) : undefined,
        readingC: Number(payload.readingC ?? payload.reading_c ?? 0),
        humidityPct: payload.humidityPct != null ? Number(payload.humidityPct) : undefined,
        source: payload.source === 'manual' || payload.source === 'iot' ? payload.source : 'manual',
      })
      break
    }
    case 'delivery.pod': {
      const { updateDeliveryStatus } = await import('@/lib/modules/logistics/service')
      await updateDeliveryStatus(tenantId, String(payload.deliveryId), {
        status: 'delivered',
        proofNotes: String(payload.notes || 'POD via offline sync'),
      } as Parameters<typeof updateDeliveryStatus>[2])
      break
    }
    default:
      throw new Error(`Unknown offline action: ${actionType}`)
  }
}

export async function listPendingOffline(tenantId: string, userId: string) {
  return query(
    `SELECT id, action_type, client_timestamp, created_at FROM offline_sync_queue
     WHERE ${tenantWhere()} AND user_id = ? AND status = 'pending'`,
    [tenantId, userId],
  )
}

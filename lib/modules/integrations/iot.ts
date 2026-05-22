import { execute, generateId, query, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { recordTemperatureReading } from '@/lib/modules/coldchain/service'
import { evaluateTemperatureReading } from '@/lib/modules/coldchain/alerts'
import { createColdchainAlert } from '@/lib/modules/coldchain/alerts'
import { touchDeviceLastSeen } from './devices'
import type { IngestContext } from './ingest-auth'

export interface IotWebhookPayload {
  sensorId?: string
  facilityId?: string
  zoneId?: string
  eventType: string
  temperatureC?: number
  humidityPct?: number
  doorOpen?: boolean
  powerOk?: boolean
  recordedAt?: string
  raw?: Record<string, unknown>
}

export interface IotIngestResult {
  eventId: string
  readingId?: string
  alertId?: string
}

export async function ingestIotWebhook(
  ctx: IngestContext,
  payload: IotWebhookPayload,
): Promise<IotIngestResult> {
  const tenantId = ctx.tenantId
  const eventId = generateId()
  const eventType = payload.eventType || 'temperature_reading'

  const facilityId = payload.facilityId ?? ctx.device?.facility_id ?? undefined
  const zoneId = payload.zoneId ?? ctx.device?.zone_id ?? undefined
  const sensorId = payload.sensorId ?? ctx.device?.external_id ?? ctx.device?.device_key

  await execute(
    `INSERT INTO iot_sensor_events
     (id, tenant_id, facility_id, zone_id, sensor_id, device_id, event_type, payload, processed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      eventId,
      tenantId,
      facilityId ?? null,
      zoneId ?? null,
      sensorId ?? null,
      ctx.device?.id ?? null,
      eventType,
      JSON.stringify(payload.raw ?? payload),
    ],
  )

  let readingId: string | undefined
  let alertId: string | undefined

  if (payload.temperatureC != null) {
    const reading = await recordTemperatureReading(tenantId, {
      facilityId,
      zoneId,
      readingC: payload.temperatureC,
      humidityPct: payload.humidityPct,
      recordedAt: payload.recordedAt,
      source: 'iot',
    })
    readingId = reading.id
    const aid = await evaluateTemperatureReading(tenantId, payload.temperatureC, {
      zoneId,
      facilityId,
    })
    if (aid) alertId = aid
  }

  if (payload.doorOpen === true) {
    alertId = await createColdchainAlert(tenantId, {
      facilityId: facilityId ?? null,
      zoneId,
      alertType: 'door',
      severity: 'warning',
      message: `Door opened${zoneId ? ` at zone ${zoneId}` : ''}${sensorId ? ` (sensor ${sensorId})` : ''}`,
    })
  }

  if (payload.powerOk === false) {
    alertId = await createColdchainAlert(tenantId, {
      facilityId: facilityId ?? null,
      zoneId,
      alertType: 'power',
      severity: 'critical',
      message: `Power loss detected${facilityId ? ` at facility` : ''}`,
    })
  }

  if (ctx.device?.id) {
    await touchDeviceLastSeen(ctx.device.id, tenantId)
  }

  await execute(
    `UPDATE iot_sensor_events SET processed = 1 WHERE id = ? AND ${tenantWhere()}`,
    [eventId, tenantId],
  )

  return { eventId, readingId, alertId }
}

export async function listIotSensorEvents(
  tenantId: string,
  opts?: { page?: number; limit?: number; processed?: boolean },
) {
  const page = opts?.page ?? 1
  const limit = Math.min(opts?.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts?.processed === true) {
    conditions.push('processed = 1')
  } else if (opts?.processed === false) {
    conditions.push('processed = 0')
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM iot_sensor_events ${where}`,
    params,
  )
  const events = await query(
    `SELECT id, tenant_id, facility_id, zone_id, sensor_id, device_id, event_type, processed, created_at
     FROM iot_sensor_events ${where}
     ORDER BY created_at DESC ${pagination.clause}`,
    params,
  )
  return { events, total: countRow?.total ?? 0 }
}

import { execute, generateId, query, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { touchDeviceLastSeen } from './devices'
import type { IngestContext } from './ingest-auth'

export interface GpsIngestPayload {
  boatId?: string
  latitude: number
  longitude: number
  speedKnots?: number
  headingDeg?: number
  accuracyM?: number
  recordedAt?: string
}

export interface GpsIngestResult {
  telemetryId: string
  boatId: string
}

export async function ingestGpsTelemetry(
  ctx: IngestContext,
  payload: GpsIngestPayload,
): Promise<GpsIngestResult> {
  const boatId = payload.boatId ?? ctx.device?.boat_id ?? null
  if (!boatId) throw new Error('boatId required (or register device with boat_id)')

  const id = generateId()
  await execute(
    `INSERT INTO gps_telemetry
     (id, tenant_id, boat_id, device_id, latitude, longitude, speed_knots, heading_deg,
      accuracy_m, recorded_at, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), 'iot')`,
    [
      id,
      ctx.tenantId,
      boatId,
      ctx.device?.id ?? null,
      payload.latitude,
      payload.longitude,
      payload.speedKnots ?? null,
      payload.headingDeg ?? null,
      payload.accuracyM ?? null,
      payload.recordedAt ?? null,
    ],
  )

  if (ctx.device?.id) {
    await touchDeviceLastSeen(ctx.device.id, ctx.tenantId)
  }

  await execute(
    `UPDATE boats SET gps_enabled = 1 WHERE id = ? AND ${tenantWhere()}`,
    [boatId, ctx.tenantId],
  )

  return { telemetryId: id, boatId }
}

export async function listGpsTelemetry(
  tenantId: string,
  opts: { boatId?: string; page?: number; limit?: number },
) {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 200)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.boatId) {
    conditions.push('boat_id = ?')
    params.push(opts.boatId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM gps_telemetry ${where}`,
    params,
  )
  const rows = await query(
    `SELECT * FROM gps_telemetry ${where} ORDER BY recorded_at DESC ${pagination.clause}`,
    params,
  )
  return { telemetry: rows, total: countRow?.total ?? 0 }
}

export async function getLatestBoatPositions(tenantId: string, limit = 20) {
  return query<{
    boat_id: string
    boat_name: string
    latitude: number
    longitude: number
    recorded_at: string
    speed_knots: number | null
  }>(
    `SELECT t.boat_id, b.name as boat_name, t.latitude, t.longitude, t.recorded_at, t.speed_knots
     FROM gps_telemetry t
     INNER JOIN (
       SELECT boat_id, MAX(recorded_at) as max_at
       FROM gps_telemetry WHERE ${tenantWhere()}
       GROUP BY boat_id
     ) latest ON t.boat_id = latest.boat_id AND t.recorded_at = latest.max_at
     LEFT JOIN boats b ON b.id = t.boat_id
     WHERE ${tenantWhere('t')}
     ORDER BY t.recorded_at DESC
     LIMIT ?`,
    [tenantId, tenantId, limit],
  )
}

import { execute, generateId, query, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { touchDeviceLastSeen } from './devices'
import type { IngestContext } from './ingest-auth'

export interface ScaleIngestPayload {
  weightKg: number
  unit?: 'kg' | 'lb'
  referenceType?: string
  referenceId?: string
  locationLabel?: string
  recordedAt?: string
  metadata?: Record<string, unknown>
}

export async function ingestScaleReading(
  ctx: IngestContext,
  payload: ScaleIngestPayload,
): Promise<{ readingId: string }> {
  const id = generateId()
  let weightKg = payload.weightKg
  if (payload.unit === 'lb') {
    weightKg = payload.weightKg * 0.453592
  }

  await execute(
    `INSERT INTO scale_readings
     (id, tenant_id, device_id, weight_kg, unit, reference_type, reference_id,
      location_label, recorded_at, source, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), 'iot', ?)`,
    [
      id,
      ctx.tenantId,
      ctx.device?.id ?? null,
      weightKg,
      payload.unit ?? 'kg',
      payload.referenceType ?? null,
      payload.referenceId ?? null,
      payload.locationLabel ?? null,
      payload.recordedAt ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    ],
  )

  if (ctx.device?.id) {
    await touchDeviceLastSeen(ctx.device.id, ctx.tenantId)
  }

  return { readingId: id }
}

export async function listScaleReadings(
  tenantId: string,
  opts?: { page?: number; limit?: number },
) {
  const page = opts?.page ?? 1
  const limit = Math.min(opts?.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const params = [tenantId]
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM scale_readings WHERE ${tenantWhere()}`,
    params,
  )
  const rows = await query(
    `SELECT * FROM scale_readings WHERE ${tenantWhere()}
     ORDER BY recorded_at DESC ${pagination.clause}`,
    params,
  )
  return { readings: rows, total: countRow?.total ?? 0 }
}

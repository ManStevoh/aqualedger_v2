import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'

export async function createQualityInspection(
  tenantId: string,
  inspectorId: string,
  input: {
    catchId?: string | null
    tripId?: string | null
    landingSiteId?: string | null
    gradeAssigned: 'A' | 'B' | 'C' | 'reject'
    freshnessScore?: number | null
    parasiteCheck?: boolean
    temperatureC?: number | null
    notes?: string | null
  },
) {
  const id = generateId()
  await execute(
    `INSERT INTO catch_quality_inspections (
      id, tenant_id, catch_id, trip_id, landing_site_id, inspector_id,
      grade_assigned, freshness_score, parasite_check, temperature_c, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.catchId ?? null,
      input.tripId ?? null,
      input.landingSiteId ?? null,
      inspectorId,
      input.gradeAssigned,
      input.freshnessScore ?? null,
      input.parasiteCheck ? 1 : 0,
      input.temperatureC ?? null,
      input.notes ?? null,
    ],
  )

  if (input.catchId && input.gradeAssigned !== 'reject') {
    await execute(`UPDATE catches SET grade = ? WHERE id = ? AND ${tenantWhere()}`, [
      input.gradeAssigned,
      input.catchId,
      tenantId,
    ])
  }

  return queryOne(`SELECT * FROM catch_quality_inspections WHERE id = ?`, [id])
}

export async function listQualityInspections(tenantId: string, tripId?: string) {
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]
  if (tripId) {
    conditions.push('trip_id = ?')
    params.push(tripId)
  }
  return query(
    `SELECT * FROM catch_quality_inspections WHERE ${conditions.join(' AND ')} ORDER BY inspected_at DESC LIMIT 100`,
    params,
  )
}

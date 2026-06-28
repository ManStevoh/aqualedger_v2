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
  const conditions = [tenantWhere('qi.tenant_id')]
  const params: unknown[] = [tenantId]
  if (tripId) {
    conditions.push('qi.trip_id = ?')
    params.push(tripId)
  }
  return query(
    `SELECT qi.*, 
            CONCAT(u.first_name, ' ', u.last_name) as inspector_name,
            b.name as boat_name,
            fs.name as species_name,
            c.quantity_kg as catch_qty
     FROM catch_quality_inspections qi
     LEFT JOIN users u ON qi.inspector_id = u.id
     LEFT JOIN catches c ON qi.catch_id = c.id
     LEFT JOIN fishing_trips t ON qi.trip_id = t.id
     LEFT JOIN boats b ON t.boat_id = b.id
     LEFT JOIN fish_species fs ON c.species_id = fs.id
     WHERE ${conditions.join(' AND ')} ORDER BY qi.inspected_at DESC LIMIT 100`,
    params,
  )
}

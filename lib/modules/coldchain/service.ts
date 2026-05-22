import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export type StorageZoneStatus = 'active' | 'maintenance' | 'offline'
export type TemperatureSource = 'manual' | 'iot' | 'import'

export interface StorageZone {
  id: string
  facility_id: string
  tenant_id: string
  code: string
  name: string
  target_temp_c: number
  min_temp_c: number | null
  max_temp_c: number | null
  capacity_kg: number | null
  status: StorageZoneStatus
  created_at: string
}

export interface CreateStorageZoneInput {
  facilityId: string
  code: string
  name: string
  targetTempC: number
  minTempC?: number
  maxTempC?: number
  capacityKg?: number
  status?: StorageZoneStatus
}

export interface UpdateStorageZoneInput {
  code?: string
  name?: string
  targetTempC?: number
  minTempC?: number | null
  maxTempC?: number | null
  capacityKg?: number | null
  status?: StorageZoneStatus
}

export interface TemperatureReading {
  id: string
  tenant_id: string
  zone_id: string | null
  facility_id: string | null
  reading_c: number
  humidity_pct: number | null
  recorded_at: string
  source: TemperatureSource
}

export interface RecordTemperatureInput {
  zoneId?: string
  facilityId?: string
  readingC: number
  humidityPct?: number
  source?: TemperatureSource
  recordedAt?: string
}

export interface HaccpChecklist {
  id: string
  tenant_id: string
  facility_id: string | null
  checklist_date: string
  inspector_name: string | null
  items: unknown
  overall_pass: number
  corrective_actions: string | null
  created_by: string | null
  created_at: string
}

export interface CreateHaccpChecklistInput {
  facilityId?: string
  checklistDate: string
  inspectorName?: string
  items: unknown[]
  overallPass?: boolean
  correctiveActions?: string
}

export async function listStorageZones(
  tenantId: string,
  facilityId: string,
  page = 1,
  limit = 50,
): Promise<{ zones: StorageZone[]; total: number }> {
  const pagination = buildPagination(page, limit)
  const params = [tenantId, facilityId]

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM storage_zones
     WHERE ${tenantWhere()} AND facility_id = ?`,
    params,
  )
  const total = countRow?.total ?? 0

  const zones = await query<StorageZone>(
    `SELECT * FROM storage_zones
     WHERE ${tenantWhere()} AND facility_id = ?
     ORDER BY code ASC
     ${pagination.clause}`,
    params,
  )

  return { zones, total }
}

export async function createStorageZone(
  tenantId: string,
  input: CreateStorageZoneInput,
): Promise<StorageZone> {
  const id = generateId()

  await execute(
    `INSERT INTO storage_zones
     (id, facility_id, tenant_id, code, name, target_temp_c, min_temp_c, max_temp_c, capacity_kg, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.facilityId,
      tenantId,
      input.code,
      input.name,
      input.targetTempC,
      input.minTempC ?? null,
      input.maxTempC ?? null,
      input.capacityKg ?? null,
      input.status ?? 'active',
    ],
  )

  const zone = await queryOne<StorageZone>(
    `SELECT * FROM storage_zones WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!zone) {
    throw new Error('Failed to create storage zone')
  }
  return zone
}

export async function updateStorageZone(
  tenantId: string,
  zoneId: string,
  input: UpdateStorageZoneInput,
): Promise<StorageZone> {
  const existing = await queryOne<StorageZone>(
    `SELECT * FROM storage_zones WHERE id = ? AND ${tenantWhere()}`,
    [zoneId, tenantId],
  )
  if (!existing) {
    throw notFound('Storage zone not found')
  }

  const fields: string[] = []
  const params: unknown[] = []

  if (input.code !== undefined) {
    fields.push('code = ?')
    params.push(input.code)
  }
  if (input.name !== undefined) {
    fields.push('name = ?')
    params.push(input.name)
  }
  if (input.targetTempC !== undefined) {
    fields.push('target_temp_c = ?')
    params.push(input.targetTempC)
  }
  if (input.minTempC !== undefined) {
    fields.push('min_temp_c = ?')
    params.push(input.minTempC)
  }
  if (input.maxTempC !== undefined) {
    fields.push('max_temp_c = ?')
    params.push(input.maxTempC)
  }
  if (input.capacityKg !== undefined) {
    fields.push('capacity_kg = ?')
    params.push(input.capacityKg)
  }
  if (input.status !== undefined) {
    fields.push('status = ?')
    params.push(input.status)
  }

  if (fields.length > 0) {
    params.push(zoneId, tenantId)
    await execute(
      `UPDATE storage_zones SET ${fields.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const zone = await queryOne<StorageZone>(
    `SELECT * FROM storage_zones WHERE id = ? AND ${tenantWhere()}`,
    [zoneId, tenantId],
  )
  if (!zone) {
    throw notFound('Storage zone not found')
  }
  return zone
}

export async function deleteStorageZone(tenantId: string, zoneId: string): Promise<void> {
  const result = await execute(
    `DELETE FROM storage_zones WHERE id = ? AND ${tenantWhere()}`,
    [zoneId, tenantId],
  )
  if (result.affectedRows === 0) {
    throw notFound('Storage zone not found')
  }
}

export async function listTemperatureReadings(
  tenantId: string,
  opts: { zoneId?: string; facilityId?: string; page?: number; limit?: number },
): Promise<{ readings: TemperatureReading[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.zoneId) {
    conditions.push('zone_id = ?')
    params.push(opts.zoneId)
  }
  if (opts.facilityId) {
    conditions.push('facility_id = ?')
    params.push(opts.facilityId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM temperature_readings ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const readings = await query<TemperatureReading>(
    `SELECT * FROM temperature_readings ${where}
     ORDER BY recorded_at DESC
     ${pagination.clause}`,
    params,
  )

  return { readings, total }
}

export async function recordTemperatureReading(
  tenantId: string,
  input: RecordTemperatureInput,
): Promise<TemperatureReading> {
  const id = generateId()

  await execute(
    `INSERT INTO temperature_readings
     (id, tenant_id, zone_id, facility_id, reading_c, humidity_pct, recorded_at, source)
     VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?)`,
    [
      id,
      tenantId,
      input.zoneId ?? null,
      input.facilityId ?? null,
      input.readingC,
      input.humidityPct ?? null,
      input.recordedAt ?? null,
      input.source ?? 'manual',
    ],
  )

  const reading = await queryOne<TemperatureReading>(
    `SELECT * FROM temperature_readings WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!reading) {
    throw new Error('Failed to record temperature')
  }

  if (input.source !== 'import') {
    const { evaluateTemperatureReading } = await import('@/lib/modules/coldchain/alerts')
    await evaluateTemperatureReading(tenantId, input.readingC, {
      zoneId: input.zoneId,
      facilityId: input.facilityId,
    }).catch(() => {})
  }

  return reading
}

export async function listHaccpChecklists(
  tenantId: string,
  opts: { facilityId?: string; page?: number; limit?: number },
): Promise<{ checklists: HaccpChecklist[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts.facilityId) {
    conditions.push('facility_id = ?')
    params.push(opts.facilityId)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM haccp_checklists ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const checklists = await query<HaccpChecklist>(
    `SELECT * FROM haccp_checklists ${where}
     ORDER BY checklist_date DESC, created_at DESC
     ${pagination.clause}`,
    params,
  )

  return { checklists, total }
}

export async function createHaccpChecklist(
  tenantId: string,
  input: CreateHaccpChecklistInput,
  createdBy?: string,
): Promise<HaccpChecklist> {
  const id = generateId()

  await execute(
    `INSERT INTO haccp_checklists
     (id, tenant_id, facility_id, checklist_date, inspector_name, items, overall_pass, corrective_actions, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.facilityId ?? null,
      input.checklistDate,
      input.inspectorName ?? null,
      JSON.stringify(input.items),
      input.overallPass ? 1 : 0,
      input.correctiveActions ?? null,
      createdBy ?? null,
    ],
  )

  const checklist = await queryOne<HaccpChecklist>(
    `SELECT * FROM haccp_checklists WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!checklist) {
    throw new Error('Failed to create HACCP checklist')
  }
  return checklist
}

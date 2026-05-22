import crypto from 'crypto'
import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound, conflict } from '@/lib/api-handler'

export type IotDeviceType =
  | 'temperature_probe'
  | 'humidity_sensor'
  | 'door_sensor'
  | 'scale'
  | 'gps_tracker'
  | 'gateway'
  | 'barcode_scanner'
  | 'other'

export type IotDeviceStatus = 'active' | 'inactive' | 'maintenance'

export interface IotDevice {
  id: string
  tenant_id: string
  device_key: string
  name: string
  device_type: IotDeviceType
  external_id: string | null
  facility_id: string | null
  zone_id: string | null
  boat_id: string | null
  metadata: Record<string, unknown> | null
  status: IotDeviceStatus
  last_seen_at: string | null
  created_at: string
}

function hashDeviceKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateDeviceKey(): string {
  return `dev_${crypto.randomBytes(16).toString('hex')}`
}

function parseMetadata(raw: string | Record<string, unknown> | null): Record<string, unknown> | null {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function listIotDevices(
  tenantId: string,
  opts?: { type?: IotDeviceType; status?: IotDeviceStatus; page?: number; limit?: number },
): Promise<{ devices: IotDevice[]; total: number }> {
  const page = opts?.page ?? 1
  const limit = Math.min(opts?.limit ?? 50, 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere()]
  const params: unknown[] = [tenantId]

  if (opts?.type) {
    conditions.push('device_type = ?')
    params.push(opts.type)
  }
  if (opts?.status) {
    conditions.push('status = ?')
    params.push(opts.status)
  }

  const where = `WHERE ${conditions.join(' AND ')}`
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM iot_devices ${where}`,
    params,
  )
  const rows = await query<Omit<IotDevice, 'metadata'> & { metadata: string | null }>(
    `SELECT id, tenant_id, device_key, name, device_type, external_id, facility_id, zone_id,
            boat_id, metadata, status, last_seen_at, created_at
     FROM iot_devices ${where}
     ORDER BY created_at DESC ${pagination.clause}`,
    params,
  )

  return {
    total: countRow?.total ?? 0,
    devices: rows.map((r) => ({ ...r, metadata: parseMetadata(r.metadata) })),
  }
}

export async function createIotDevice(
  tenantId: string,
  input: {
    name: string
    deviceType: IotDeviceType
    externalId?: string
    facilityId?: string
    zoneId?: string
    boatId?: string
    metadata?: Record<string, unknown>
  },
): Promise<IotDevice & { ingestKey: string }> {
  if (input.externalId) {
    const dup = await queryOne<{ id: string }>(
      `SELECT id FROM iot_devices WHERE ${tenantWhere()} AND external_id = ?`,
      [tenantId, input.externalId],
    )
    if (dup) throw conflict('External device id already registered')
  }

  const id = generateId()
  const ingestKey = generateDeviceKey()
  const deviceKey = ingestKey.slice(0, 12)
  const keyHash = hashDeviceKey(ingestKey)

  await execute(
    `INSERT INTO iot_devices
     (id, tenant_id, device_key, device_key_hash, name, device_type, external_id,
      facility_id, zone_id, boat_id, metadata, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      id,
      tenantId,
      deviceKey,
      keyHash,
      input.name,
      input.deviceType,
      input.externalId ?? null,
      input.facilityId ?? null,
      input.zoneId ?? null,
      input.boatId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  )

  const device = await getIotDevice(tenantId, id)
  if (!device) throw new Error('Failed to create device')
  return { ...device, ingestKey }
}

export async function getIotDevice(tenantId: string, deviceId: string): Promise<IotDevice | null> {
  const row = await queryOne<Omit<IotDevice, 'metadata'> & { metadata: string | null }>(
    `SELECT id, tenant_id, device_key, name, device_type, external_id, facility_id, zone_id,
            boat_id, metadata, status, last_seen_at, created_at
     FROM iot_devices WHERE id = ? AND ${tenantWhere()}`,
    [deviceId, tenantId],
  )
  if (!row) return null
  return { ...row, metadata: parseMetadata(row.metadata) }
}

export async function resolveDeviceByIngestKey(
  ingestKey: string,
): Promise<(IotDevice & { device_key_hash: string }) | null> {
  const hash = hashDeviceKey(ingestKey)
  const row = await queryOne<Omit<IotDevice, 'metadata'> & { metadata: string | null; device_key_hash: string }>(
    `SELECT id, tenant_id, device_key, device_key_hash, name, device_type, external_id,
            facility_id, zone_id, boat_id, metadata, status, last_seen_at, created_at
     FROM iot_devices WHERE device_key_hash = ? AND status = 'active' LIMIT 1`,
    [hash],
  )
  if (!row) return null
  return { ...row, metadata: parseMetadata(row.metadata) }
}

export async function touchDeviceLastSeen(deviceId: string, tenantId: string): Promise<void> {
  await execute(
    `UPDATE iot_devices SET last_seen_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [deviceId, tenantId],
  )
}

export async function rotateDeviceIngestKey(
  tenantId: string,
  deviceId: string,
): Promise<{ ingestKey: string }> {
  const existing = await getIotDevice(tenantId, deviceId)
  if (!existing) throw notFound('Device not found')

  const ingestKey = generateDeviceKey()
  const keyHash = hashDeviceKey(ingestKey)
  await execute(
    `UPDATE iot_devices SET device_key_hash = ?, device_key = ? WHERE id = ? AND ${tenantWhere()}`,
    [keyHash, ingestKey.slice(0, 12), deviceId, tenantId],
  )
  return { ingestKey }
}

export async function updateIotDevice(
  tenantId: string,
  deviceId: string,
  input: Partial<{
    name: string
    status: IotDeviceStatus
    facilityId: string | null
    zoneId: string | null
    boatId: string | null
    metadata: Record<string, unknown>
  }>,
): Promise<IotDevice> {
  const existing = await getIotDevice(tenantId, deviceId)
  if (!existing) throw notFound('Device not found')

  const fields: string[] = []
  const params: unknown[] = []

  if (input.name !== undefined) {
    fields.push('name = ?')
    params.push(input.name)
  }
  if (input.status !== undefined) {
    fields.push('status = ?')
    params.push(input.status)
  }
  if (input.facilityId !== undefined) {
    fields.push('facility_id = ?')
    params.push(input.facilityId)
  }
  if (input.zoneId !== undefined) {
    fields.push('zone_id = ?')
    params.push(input.zoneId)
  }
  if (input.boatId !== undefined) {
    fields.push('boat_id = ?')
    params.push(input.boatId)
  }
  if (input.metadata !== undefined) {
    fields.push('metadata = ?')
    params.push(JSON.stringify(input.metadata))
  }

  if (fields.length > 0) {
    params.push(deviceId, tenantId)
    await execute(
      `UPDATE iot_devices SET ${fields.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const updated = await getIotDevice(tenantId, deviceId)
  if (!updated) throw notFound('Device not found')
  return updated
}

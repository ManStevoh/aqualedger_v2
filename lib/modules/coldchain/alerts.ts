import { execute, generateId, queryOne } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { publishDomainEvent } from '@/lib/events/workflow'
import { dispatchWebhooksForEvent } from '@/lib/modules/integrations/webhook-dispatch'
import type { StorageZone } from './service'

export type ColdchainAlertType = 'temperature' | 'humidity' | 'door' | 'power'
export type ColdchainAlertSeverity = 'info' | 'warning' | 'critical'

export interface CreateColdchainAlertInput {
  facilityId?: string | null
  alertType: ColdchainAlertType
  severity: ColdchainAlertSeverity
  message: string
  readingValue?: number
  zoneId?: string
}

export async function createColdchainAlert(
  tenantId: string,
  input: CreateColdchainAlertInput,
): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO coldchain_alerts
     (id, tenant_id, facility_id, alert_type, severity, message, reading_value, resolved)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      tenantId,
      input.facilityId ?? null,
      input.alertType,
      input.severity,
      input.message.slice(0, 500),
      input.readingValue ?? null,
    ],
  )

  const eventType =
    input.severity === 'critical' ? 'coldchain.temperature.critical' : 'temp.alert'

  await publishDomainEvent({
    tenantId,
    eventType,
    aggregateType: 'coldchain_alert',
    aggregateId: id,
    payload: {
      alertId: id,
      facilityId: input.facilityId,
      zoneId: input.zoneId,
      severity: input.severity,
      message: input.message,
      readingValue: input.readingValue,
    },
  })

  await dispatchWebhooksForEvent(tenantId, eventType, {
    alert_id: id,
    facility_id: input.facilityId,
    zone_id: input.zoneId,
    severity: input.severity,
    message: input.message,
    reading_value: input.readingValue,
  }).catch(() => {})

  return id
}

export async function evaluateTemperatureReading(
  tenantId: string,
  readingC: number,
  opts: { zoneId?: string; facilityId?: string },
): Promise<string | null> {
  if (!opts.zoneId) return null

  const zone = await queryOne<StorageZone>(
    `SELECT * FROM storage_zones WHERE id = ? AND ${tenantWhere()}`,
    [opts.zoneId, tenantId],
  )
  if (!zone) return null

  const min = zone.min_temp_c != null ? Number(zone.min_temp_c) : null
  const max = zone.max_temp_c != null ? Number(zone.max_temp_c) : null
  const target = Number(zone.target_temp_c)

  let severity: ColdchainAlertSeverity | null = null
  let message = ''

  if (min != null && readingC < min) {
    const delta = min - readingC
    severity = delta >= 3 ? 'critical' : 'warning'
    message = `Zone ${zone.name}: ${readingC}°C below minimum ${min}°C (target ${target}°C)`
  } else if (max != null && readingC > max) {
    const delta = readingC - max
    severity = delta >= 3 ? 'critical' : 'warning'
    message = `Zone ${zone.name}: ${readingC}°C above maximum ${max}°C (target ${target}°C)`
  }

  if (!severity) return null

  return createColdchainAlert(tenantId, {
    facilityId: opts.facilityId ?? zone.facility_id,
    zoneId: opts.zoneId,
    alertType: 'temperature',
    severity,
    message,
    readingValue: readingC,
  })
}

import { query, execute } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { deliverReport, type DeliverReportInput } from './report-delivery'
import type { DeliveryChannel } from './report-registry'

interface ScheduledRow {
  id: string
  tenant_id: string
  report_type: string
  frequency: string
  recipients: string | string[]
  delivery_channels: string | null
  phone_recipients: string | null
  export_format: string | null
  period_days: number | null
  subject_override: string | null
  bcc_recipients: string | null
  last_run_at: string | null
  active: number
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function isDue(row: ScheduledRow): boolean {
  if (!row.active) return false
  const last = row.last_run_at ? new Date(row.last_run_at) : null
  const now = new Date()
  if (!last) return true

  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
  switch (row.frequency) {
    case 'daily':
      return hoursSince >= 23
    case 'weekly':
      return hoursSince >= 24 * 6.5
    case 'monthly':
      return hoursSince >= 24 * 28
    default:
      return hoursSince >= 24
  }
}

export async function runDueScheduledReports(
  tenantId?: string,
): Promise<{ processed: number; results: { reportId: string; ok: boolean; error?: string }[] }> {
  const conditions = ['active = 1']
  const params: unknown[] = []
  if (tenantId) {
    conditions.push(tenantWhere())
    params.push(tenantId)
  }

  const rows = await query<ScheduledRow>(
    `SELECT * FROM scheduled_reports WHERE ${conditions.join(' AND ')}`,
    params,
  )

  const results: { reportId: string; ok: boolean; error?: string }[] = []
  let processed = 0

  for (const row of rows) {
    if (!isDue(row)) continue
    processed++

    const emails = parseJsonArray(
      typeof row.recipients === 'string' ? row.recipients : JSON.stringify(row.recipients),
    )
    const phones = parseJsonArray(row.phone_recipients)
    const channels = parseJsonArray(row.delivery_channels) as DeliveryChannel[]
    const deliveryChannels: DeliveryChannel[] =
      channels.length > 0 ? channels : (['email'] as DeliveryChannel[])

    const bcc = parseJsonArray(row.bcc_recipients)

    const input: DeliverReportInput = {
      tenantId: row.tenant_id,
      reportType: row.report_type,
      periodDays: row.period_days ?? 30,
      format: (row.export_format as 'csv' | 'json' | 'html') || 'csv',
      channels: deliveryChannels,
      emailRecipients: emails,
      phoneRecipients: phones,
      bccRecipients: bcc,
      subjectOverride: row.subject_override || undefined,
      scheduledReportId: row.id,
      saveSnapshot: true,
      shareExpiresHours: 168,
    }

    try {
      await deliverReport(input)
      await execute(`UPDATE scheduled_reports SET last_run_at = NOW() WHERE id = ?`, [row.id])
      results.push({ reportId: row.id, ok: true })
    } catch (err) {
      results.push({
        reportId: row.id,
        ok: false,
        error: err instanceof Error ? err.message : 'Delivery failed',
      })
    }
  }

  return { processed, results }
}

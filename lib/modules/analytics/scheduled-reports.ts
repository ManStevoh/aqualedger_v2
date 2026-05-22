import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export type ReportFrequency = 'daily' | 'weekly' | 'monthly'

export interface ScheduledReport {
  id: string
  tenant_id: string
  report_type: string
  frequency: ReportFrequency
  recipients: unknown
  last_run_at: string | null
  active: number
  created_at: string
}

export interface CreateScheduledReportInput {
  reportType: string
  frequency: ReportFrequency
  recipients: string[]
  phoneRecipients?: string[]
  deliveryChannels?: string[]
  exportFormat?: string
  periodDays?: number
  subjectOverride?: string
  bccRecipients?: string[]
  active?: boolean
}

export interface UpdateScheduledReportInput {
  reportType?: string
  frequency?: ReportFrequency
  recipients?: string[]
  active?: boolean
}

export async function listScheduledReports(
  tenantId: string,
  page = 1,
  limit = 50,
): Promise<{ reports: ScheduledReport[]; total: number }> {
  const pagination = buildPagination(page, limit)

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM scheduled_reports WHERE ${tenantWhere()}`,
    [tenantId],
  )
  const total = countRow?.total ?? 0

  const reports = await query<ScheduledReport>(
    `SELECT * FROM scheduled_reports WHERE ${tenantWhere()}
     ORDER BY created_at DESC
     ${pagination.clause}`,
    [tenantId],
  )

  return { reports, total }
}

export async function createScheduledReport(
  tenantId: string,
  input: CreateScheduledReportInput,
): Promise<ScheduledReport> {
  const id = generateId()
  await execute(
    `INSERT INTO scheduled_reports
     (id, tenant_id, report_type, frequency, recipients, delivery_channels, phone_recipients, export_format, period_days, subject_override, bcc_recipients, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      input.reportType,
      input.frequency,
      JSON.stringify(input.recipients),
      JSON.stringify(input.deliveryChannels || ['email']),
      JSON.stringify(input.phoneRecipients || []),
      input.exportFormat || 'csv',
      input.periodDays ?? 30,
      input.subjectOverride ?? null,
      JSON.stringify(input.bccRecipients || []),
      input.active !== false ? 1 : 0,
    ],
  )

  const report = await queryOne<ScheduledReport>(
    `SELECT * FROM scheduled_reports WHERE id = ? AND ${tenantWhere()}`,
    [id, tenantId],
  )
  if (!report) {
    throw new Error('Failed to create scheduled report')
  }
  return report
}

export async function updateScheduledReport(
  tenantId: string,
  reportId: string,
  input: UpdateScheduledReportInput,
): Promise<ScheduledReport> {
  const existing = await queryOne<ScheduledReport>(
    `SELECT * FROM scheduled_reports WHERE id = ? AND ${tenantWhere()}`,
    [reportId, tenantId],
  )
  if (!existing) {
    throw notFound('Scheduled report not found')
  }

  const fields: string[] = []
  const params: unknown[] = []

  if (input.reportType !== undefined) {
    fields.push('report_type = ?')
    params.push(input.reportType)
  }
  if (input.frequency !== undefined) {
    fields.push('frequency = ?')
    params.push(input.frequency)
  }
  if (input.recipients !== undefined) {
    fields.push('recipients = ?')
    params.push(JSON.stringify(input.recipients))
  }
  if (input.active !== undefined) {
    fields.push('active = ?')
    params.push(input.active ? 1 : 0)
  }

  if (fields.length > 0) {
    params.push(reportId, tenantId)
    await execute(
      `UPDATE scheduled_reports SET ${fields.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const report = await queryOne<ScheduledReport>(
    `SELECT * FROM scheduled_reports WHERE id = ? AND ${tenantWhere()}`,
    [reportId, tenantId],
  )
  if (!report) {
    throw notFound('Scheduled report not found')
  }
  return report
}

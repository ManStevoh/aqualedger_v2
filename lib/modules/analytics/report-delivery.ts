import crypto from 'crypto'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { generateReport, type GeneratedReport } from './report-generators'
import { getReportDefinition, type DeliveryChannel } from './report-registry'
import {
  reportToCsv,
  reportToJson,
  reportToHtml,
  reportToSmsSummary,
  filenameForReport,
} from './report-formats'
import { absolutePublicApiUrl } from '@/lib/config/urls'
import { sendEmailWithAttachment } from '@/lib/channels/email'
import { sendSms } from '@/lib/channels/sms'
import { sendWhatsApp } from '@/lib/channels/whatsapp'
import { dispatchWebhooksForEvent } from '@/lib/modules/integrations/webhook-dispatch'
import { enqueueNotification } from '@/lib/notifications/enqueue'
import { getCommunicationSettings } from '@/lib/modules/communications/settings'
import { buildBrandedReportEmail } from './report-email'
import { generateReportNarrative } from '@/lib/modules/ai/report-narrative'
import { isAiLlmEnabled } from '@/lib/modules/ai/llm'

export interface DeliverReportInput {
  tenantId: string
  reportType: string
  periodDays?: number
  format?: 'csv' | 'json' | 'html'
  channels: DeliveryChannel[]
  emailRecipients?: string[]
  phoneRecipients?: string[]
  bccRecipients?: string[]
  subjectOverride?: string
  createdBy?: string | null
  scheduledReportId?: string | null
  saveSnapshot?: boolean
  shareExpiresHours?: number
}

export interface DeliverReportResult {
  snapshotId: string | null
  shareUrl: string | null
  shareToken: string | null
  deliveries: { channel: string; recipient: string; status: string; id: string }[]
  webhook?: { delivered: number; failed: number }
}

export async function createReportSnapshot(
  tenantId: string,
  report: GeneratedReport,
  format: string,
  createdBy?: string | null,
  shareExpiresHours?: number,
): Promise<{ id: string; shareToken: string | null; shareUrl: string | null }> {
  const id = generateId()
  const shareToken = crypto.randomBytes(24).toString('hex')
  const shareExpires = shareExpiresHours
    ? new Date(Date.now() + shareExpiresHours * 3600 * 1000)
    : null

  const csv = format === 'csv' || format === 'html' ? reportToCsv(report) : null
  const html = format === 'html' ? reportToHtml(report) : null
  const jsonPayload = reportToJson(report)

  await execute(
    `INSERT INTO report_snapshots (
      id, tenant_id, report_type, title, format, period_start, period_end,
      payload, file_csv, file_html, share_token, share_expires_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      report.meta.reportType,
      report.meta.title,
      format,
      report.meta.periodStart,
      report.meta.periodEnd,
      jsonPayload,
      csv,
      html,
      shareToken,
      shareExpires,
      createdBy ?? null,
    ],
  )

  const shareUrl = absolutePublicApiUrl(`/reports/share/${shareToken}`)

  return { id, shareToken, shareUrl }
}

async function logDelivery(
  tenantId: string,
  snapshotId: string | null,
  scheduledReportId: string | null,
  channel: DeliveryChannel,
  recipient: string,
  status: 'sent' | 'failed' | 'pending',
  externalRef?: string | null,
  error?: string | null,
): Promise<string> {
  const id = generateId()
  await execute(
    `INSERT INTO report_deliveries (id, tenant_id, snapshot_id, scheduled_report_id, channel, recipient, status, external_ref, error_message, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      snapshotId,
      scheduledReportId,
      channel,
      recipient,
      status,
      externalRef ?? null,
      error?.slice(0, 500) ?? null,
      status === 'sent' ? new Date() : null,
    ],
  )
  return id
}

export async function deliverReport(input: DeliverReportInput): Promise<DeliverReportResult> {
  const def = getReportDefinition(input.reportType)
  const format = input.format || def?.defaultFormat || 'csv'
  const periodDays = input.periodDays ?? 30

  const report = await generateReport(input.tenantId, input.reportType, periodDays)

  let aiNarrativeHtml = ''
  const narrativeOn =
    process.env.AI_REPORT_NARRATIVE !== 'false' &&
    (isAiLlmEnabled() || process.env.AI_REPORT_NARRATIVE === 'always')
  if (narrativeOn) {
    try {
      const { narrative } = await generateReportNarrative(input.tenantId, report)
      const escaped = narrative
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')
      aiNarrativeHtml = `<div style="margin:16px 0;padding:16px;background:#f0fdfa;border-radius:8px;border-left:4px solid #0d9488">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#0f766e">AI Executive Summary</p>
        <div style="font-size:14px;color:#334155;line-height:1.5">${escaped}</div>
      </div>`
    } catch {
      /* narrative optional */
    }
  }

  let snapshotId: string | null = null
  let shareUrl: string | null = null
  let shareToken: string | null = null

  if (input.saveSnapshot !== false) {
    const snap = await createReportSnapshot(
      input.tenantId,
      report,
      format === 'sms-summary' ? 'json' : format,
      input.createdBy,
      input.shareExpiresHours ?? 168,
    )
    snapshotId = snap.id
    shareUrl = snap.shareUrl
    shareToken = snap.shareToken
  }

  const csv = reportToCsv(report)
  const html = aiNarrativeHtml + reportToHtml(report)
  const json = reportToJson(report)
  const smsBody = reportToSmsSummary(report)
  const filename = filenameForReport(input.reportType, format)

  const commSettings = await getCommunicationSettings(input.tenantId)
  const bcc = [
    ...(input.bccRecipients ?? []),
    ...(commSettings.default_bcc_emails ?? []),
  ].filter(Boolean)

  const deliveries: DeliverReportResult['deliveries'] = []

  for (const channel of input.channels) {
    if (channel === 'email' && input.emailRecipients?.length) {
      const branded = await buildBrandedReportEmail(
        input.tenantId,
        report,
        html,
        shareUrl,
      )
      const subject = input.subjectOverride || branded.subject

      for (const to of input.emailRecipients) {
        const result = await sendEmailWithAttachment({
          to,
          subject,
          html: branded.html,
          text: `${branded.text}\n\n${smsBody}`,
          bcc: bcc.length ? bcc : undefined,
          replyTo: commSettings.reply_to_email || undefined,
          attachments: [
            {
              filename,
              content: format === 'html' ? html : format === 'json' ? json : csv,
              contentType: format === 'html' ? 'text/html' : format === 'json' ? 'application/json' : 'text/csv',
            },
          ],
        })
        const id = await logDelivery(
          input.tenantId,
          snapshotId,
          input.scheduledReportId ?? null,
          'email',
          to,
          result.sent ? 'sent' : 'failed',
          result.messageId,
          result.error,
        )
        deliveries.push({ channel: 'email', recipient: to, status: result.sent ? 'sent' : 'failed', id })
      }
    }

    if (channel === 'sms' && input.phoneRecipients?.length) {
      for (const phone of input.phoneRecipients) {
        const result = await sendSms({ to: phone, body: smsBody })
        const id = await logDelivery(
          input.tenantId,
          snapshotId,
          input.scheduledReportId ?? null,
          'sms',
          phone,
          result.sent ? 'sent' : 'failed',
          result.messageId,
          result.error,
        )
        deliveries.push({ channel: 'sms', recipient: phone, status: result.sent ? 'sent' : 'failed', id })
      }
    }

    if (channel === 'whatsapp' && input.phoneRecipients?.length) {
      for (const phone of input.phoneRecipients) {
        const result = await sendWhatsApp({ to: phone, body: smsBody })
        const id = await logDelivery(
          input.tenantId,
          snapshotId,
          input.scheduledReportId ?? null,
          'whatsapp',
          phone,
          result.sent ? 'sent' : 'failed',
          result.messageId,
          result.error,
        )
        deliveries.push({ channel: 'whatsapp', recipient: phone, status: result.sent ? 'sent' : 'failed', id })
      }
    }
  }

  let webhookResult: { delivered: number; failed: number } | undefined
  if (input.channels.includes('webhook')) {
    webhookResult = await dispatchWebhooksForEvent(
      input.tenantId,
      def?.webhookEvent || 'report.generated',
      {
        reportType: input.reportType,
        meta: report.meta,
        shareUrl,
        snapshotId,
        rowCount: report.meta.rowCount,
      },
    )
    await logDelivery(
      input.tenantId,
      snapshotId,
      input.scheduledReportId ?? null,
      'webhook',
      'webhook_endpoints',
      webhookResult.delivered > 0 ? 'sent' : 'failed',
    )
  }

  if (input.channels.includes('in_app') && input.createdBy) {
    await enqueueNotification({
      tenantId: input.tenantId,
      channel: 'email',
      recipient: input.emailRecipients?.[0] || input.createdBy,
      subject: report.meta.title,
      body: `Report ready. ${shareUrl || 'See dashboard → Reports hub.'}`,
    })
    await logDelivery(
      input.tenantId,
      snapshotId,
      input.scheduledReportId ?? null,
      'in_app',
      input.createdBy,
      'sent',
    )
  }

  return {
    snapshotId,
    shareUrl,
    shareToken,
    deliveries,
    webhook: webhookResult,
  }
}

export async function getSnapshotByShareToken(token: string) {
  return queryOne<{
    id: string
    tenant_id: string
    report_type: string
    title: string
    format: string
    payload: string
    file_csv: string | null
    file_html: string | null
    share_expires_at: string | null
  }>(
    `SELECT * FROM report_snapshots
     WHERE share_token = ?
       AND (share_expires_at IS NULL OR share_expires_at > NOW())`,
    [token],
  )
}

export async function listReportDeliveries(tenantId: string, limit = 50) {
  return query<Record<string, unknown>>(
    `SELECT rd.*, rs.title as report_title, rs.report_type
     FROM report_deliveries rd
     LEFT JOIN report_snapshots rs ON rd.snapshot_id = rs.id
     WHERE rd.tenant_id = ?
     ORDER BY rd.created_at DESC
     LIMIT ?`,
    [tenantId, limit],
  )
}

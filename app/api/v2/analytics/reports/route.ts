import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { REPORT_CATALOG } from '@/lib/modules/analytics/report-registry'
import { generateReport } from '@/lib/modules/analytics/report-generators'
import {
  reportToCsv,
  reportToJson,
  reportToHtml,
  contentTypeForFormat,
  filenameForReport,
} from '@/lib/modules/analytics/report-formats'
import { deliverReport, listReportDeliveries } from '@/lib/modules/analytics/report-delivery'
import { getCommunicationSettings } from '@/lib/modules/communications/settings'
import { getEmailProviderStatus } from '@/lib/channels/email'
import { NextResponse } from 'next/server'

const deliverSchema = z.object({
  reportType: z.string().min(1),
  periodDays: z.coerce.number().int().min(1).max(365).default(30),
  format: z.enum(['csv', 'json', 'html']).default('csv'),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'webhook', 'in_app'])).min(1),
  emailRecipients: z.array(z.string().email()).optional(),
  phoneRecipients: z.array(z.string().min(8)).optional(),
  bccRecipients: z.array(z.string().email()).optional(),
  subjectOverride: z.string().max(255).optional(),
  shareExpiresHours: z.coerce.number().int().min(1).max(720).default(168),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.export')
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view')

  if (view === 'deliveries') {
    const deliveries = await listReportDeliveries(ctx.tenantId, 100)
    return jsonOk({ deliveries })
  }

  if (view === 'config') {
    const settings = await getCommunicationSettings(ctx.tenantId)
    const emailStatus = getEmailProviderStatus()
    return jsonOk({ settings, emailStatus, catalog: REPORT_CATALOG })
  }

  return jsonOk({ catalog: REPORT_CATALOG })
}, 'v2/analytics/reports')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.reports.deliver')
  const body = await request.json()
  const action = (body as { action?: string }).action

  if (action === 'deliver') {
    const input = deliverSchema.parse(body)
    const result = await deliverReport({
      tenantId: ctx.tenantId,
      reportType: input.reportType,
      periodDays: input.periodDays,
      format: input.format,
      channels: input.channels,
      emailRecipients: input.emailRecipients,
      phoneRecipients: input.phoneRecipients,
      bccRecipients: input.bccRecipients,
      subjectOverride: input.subjectOverride,
      createdBy: ctx.userId,
      shareExpiresHours: input.shareExpiresHours,
    })
    return jsonOk(result, 201)
  }

  const reportType = (body as { reportType?: string }).reportType || 'kpi-summary'
  const format = (body as { format?: string }).format || 'json'
  const periodDays = Number((body as { periodDays?: number }).periodDays) || 30

  const report = await generateReport(ctx.tenantId, reportType, periodDays)

  if (format === 'csv') {
    const csv = reportToCsv(report)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': contentTypeForFormat('csv'),
        'Content-Disposition': `attachment; filename="${filenameForReport(reportType, 'csv')}"`,
      },
    })
  }
  if (format === 'html') {
    const html = reportToHtml(report)
    return new NextResponse(html, {
      headers: {
        'Content-Type': contentTypeForFormat('html'),
        'Content-Disposition': `inline; filename="${filenameForReport(reportType, 'html')}"`,
      },
    })
  }

  return jsonOk({ report })
}, 'v2/analytics/reports')

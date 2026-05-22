import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { generateReport } from '@/lib/modules/analytics/report-generators'
import {
  reportToCsv,
  reportToJson,
  reportToHtml,
  contentTypeForFormat,
  filenameForReport,
} from '@/lib/modules/analytics/report-formats'
import { getReportDefinition } from '@/lib/modules/analytics/report-registry'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('analytics.export')
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'kpi-summary'
  const format = searchParams.get('format') ?? 'csv'
  const periodDays = Math.min(Math.max(Number(searchParams.get('periodDays') || 30), 1), 365)

  const def = getReportDefinition(type)
  const report = await generateReport(ctx.tenantId, type, periodDays)

  if (format === 'json') {
    return jsonOk({ meta: report.meta, sections: report.sections })
  }

  if (format === 'html') {
    const html = reportToHtml(report)
    return new NextResponse(html, {
      headers: {
        'Content-Type': contentTypeForFormat('html'),
        'Content-Disposition': `inline; filename="${filenameForReport(type, 'html')}"`,
        'X-Report-Standards': (def?.standards || []).join(', '),
      },
    })
  }

  const csv = reportToCsv(report)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': contentTypeForFormat('csv'),
      'Content-Disposition': `attachment; filename="${filenameForReport(type, 'csv')}"`,
      'X-Report-Standards': (def?.standards || []).join(', '),
    },
  })
}, 'v2/analytics/export')

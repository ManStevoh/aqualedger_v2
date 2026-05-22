import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, notFound } from '@/lib/api-handler'
import { getSnapshotByShareToken } from '@/lib/modules/analytics/report-delivery'
import { contentTypeForFormat, filenameForReport } from '@/lib/modules/analytics/report-formats'

export const GET = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const { token } = await (context?.params ?? Promise.resolve({ token: '' }))
  if (!token) throw notFound('Invalid share link')

  const snapshot = await getSnapshotByShareToken(token)
  if (!snapshot) throw notFound('Report expired or not found')

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || snapshot.format || 'csv'

  if (format === 'html' && snapshot.file_html) {
    return new NextResponse(snapshot.file_html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (format === 'json') {
    return new NextResponse(snapshot.payload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameForReport(snapshot.report_type, 'json')}"`,
      },
    })
  }

  const csv = snapshot.file_csv || snapshot.payload
  return new NextResponse(csv, {
    headers: {
      'Content-Type': contentTypeForFormat('csv'),
      'Content-Disposition': `attachment; filename="${filenameForReport(snapshot.report_type, 'csv')}"`,
    },
  })
}, 'public/reports/share')

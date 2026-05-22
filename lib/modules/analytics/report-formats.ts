import type { GeneratedReport } from './report-generators'
import { flattenReportToRows } from './report-generators'

/** UTF-8 BOM for Excel international compatibility (RFC 4180) */
const UTF8_BOM = '\uFEFF'

export function reportToCsv(report: GeneratedReport): string {
  const lines: string[] = []
  lines.push(`# ${report.meta.title}`)
  lines.push(`# Generated: ${report.meta.generatedAt}`)
  lines.push(`# Period: ${report.meta.periodStart} to ${report.meta.periodEnd}`)
  lines.push(`# Standards: ${report.meta.standards.join(', ')}`)
  lines.push('')

  for (const section of report.sections) {
    lines.push(`## ${section.title}`)
    const { headers, rows } = {
      headers: section.columns,
      rows: section.rows.map((r) =>
        section.columns.map((h) => {
          const v = r[h]
          return v == null ? '' : String(v)
        }),
      ),
    }
    lines.push(headers.map(escapeCsv).join(','))
    for (const row of rows) {
      lines.push(row.map(escapeCsv).join(','))
    }
    lines.push('')
  }

  return UTF8_BOM + lines.join('\n')
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function reportToJson(report: GeneratedReport): string {
  return JSON.stringify(
    {
      meta: report.meta,
      sections: report.sections,
    },
    null,
    2,
  )
}

export function reportToHtml(report: GeneratedReport): string {
  const sectionsHtml = report.sections
    .map((section) => {
      const headerCells = section.columns.map((c) => `<th scope="col">${escapeHtml(c)}</th>`).join('')
      const bodyRows = section.rows
        .map((row) => {
          const cells = section.columns
            .map((c) => `<td>${escapeHtml(String(row[c] ?? ''))}</td>`)
            .join('')
          return `<tr>${cells}</tr>`
        })
        .join('')
      return `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <table role="table" aria-label="${escapeHtml(section.title)}">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </section>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(report.meta.title)} — AquaERP</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #0f172a; }
    h1 { font-size: 1.5rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.875rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
    tr:nth-child(even) { background: #f8fafc; }
    footer { margin-top: 2rem; font-size: 0.75rem; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(report.meta.title)}</h1>
    <p class="meta">
      Generated ${escapeHtml(report.meta.generatedAt)} ·
      Period ${escapeHtml(report.meta.periodStart)} – ${escapeHtml(report.meta.periodEnd)} ·
      ${report.meta.rowCount} records ·
      Standards: ${escapeHtml(report.meta.standards.join(', '))}
    </p>
  </header>
  ${sectionsHtml}
  <footer>
    <p>Confidential — ${escapeHtml(report.meta.tenantId)}. AquaERP reporting. Do not redistribute without authorization.</p>
    <p>GDPR: contains business operational data. Retention per your data policy.</p>
  </footer>
</body>
</html>`
}

export function reportToSmsSummary(report: GeneratedReport): string {
  const { headers, rows } = flattenReportToRows(report)
  const top = rows.slice(0, 3)
  const parts = [
    `AquaERP ${report.meta.title}`,
    `${report.meta.periodStart}-${report.meta.periodEnd}`,
    `${report.meta.rowCount} rows`,
  ]
  for (let i = 0; i < top.length; i++) {
    const row = top[i]
    const summary = headers.slice(0, 2).map((h, j) => `${h}:${row[j]}`).join(' ')
    parts.push(summary)
  }
  const msg = parts.join(' | ')
  return msg.length > 480 ? msg.slice(0, 477) + '...' : msg
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function contentTypeForFormat(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv; charset=utf-8'
    case 'html':
      return 'text/html; charset=utf-8'
    case 'json':
    default:
      return 'application/json; charset=utf-8'
  }
}

export function filenameForReport(reportType: string, format: string): string {
  const date = new Date().toISOString().slice(0, 10)
  const ext = format === 'html' ? 'html' : format === 'json' ? 'json' : 'csv'
  return `aquaerp-${reportType}-${date}.${ext}`
}

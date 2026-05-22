import type { GeneratedReport } from './report-generators'
import { getCommunicationSettings } from '@/lib/modules/communications/settings'
import { getTemplate, renderTemplate } from '@/lib/modules/communications/templates'

export interface BrandedReportEmail {
  subject: string
  html: string
  text: string
}

export async function buildBrandedReportEmail(
  tenantId: string,
  report: GeneratedReport,
  bodyHtml: string,
  shareUrl: string | null,
): Promise<BrandedReportEmail> {
  const settings = await getCommunicationSettings(tenantId)
  const brand = settings.brand_name || 'AquaERP'
  const template = await getTemplate(tenantId, 'report_delivery', 'email')

  const vars: Record<string, string> = {
    brand,
    reportTitle: report.meta.title,
    periodStart: report.meta.periodStart,
    periodEnd: report.meta.periodEnd,
    shareUrl: shareUrl || '',
    rowCount: String(report.meta.rowCount),
    standards: report.meta.standards.join(', '),
  }

  const subject = template?.subject
    ? renderTemplate(template.subject, vars)
    : `[${brand}] ${report.meta.title} — ${report.meta.periodEnd}`

  const introHtml = template?.body_html
    ? renderTemplate(template.body_html, vars)
    : `<p>Your report is attached. <a href="${shareUrl || '#'}">View online</a></p>`

  const footer = settings.email_footer_html
    ? `<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">${settings.email_footer_html}</div>`
    : `<p style="font-size:12px;color:#94a3b8;margin-top:2rem">Sent by ${brand} · AquaERP maritime commerce platform</p>`

  const logoBlock = settings.logo_url
    ? `<img src="${settings.logo_url}" alt="${brand}" style="max-height:48px;margin-bottom:1rem"/>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:'Segoe UI',system-ui,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
    <div style="background:linear-gradient(135deg,#0f766e,#0891b2);padding:20px 24px;color:#fff">
      ${logoBlock}
      <p style="margin:0;opacity:0.9;font-size:13px">Automated intelligence report</p>
      <h1 style="margin:8px 0 0;font-size:1.35rem;font-weight:600">${report.meta.title}</h1>
    </div>
    <div style="padding:24px">
      ${introHtml}
      <p style="color:#64748b;font-size:14px">${report.meta.rowCount} records · ${report.meta.standards.join(' · ')}</p>
      ${shareUrl ? `<p><a href="${shareUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:500">Open report &amp; download</a></p>` : ''}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      ${bodyHtml}
    </div>
    ${footer}
  </div>
</body>
</html>`

  const text = template?.body_text
    ? renderTemplate(template.body_text, vars)
    : `${report.meta.title}\n${report.meta.periodStart} — ${report.meta.periodEnd}\n${shareUrl || ''}`

  return { subject, html, text }
}

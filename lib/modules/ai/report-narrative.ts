import type { GeneratedReport } from '@/lib/modules/analytics/report-generators'
import { completeWithLlm, getAiModelLabel, isAiLlmEnabled } from './llm'
import { buildTenantAiContext, formatTenantContextForPrompt } from './tenant-context'
import { saveInsight } from './insights'

function sectionsToText(report: GeneratedReport, maxRows = 12): string {
  const parts: string[] = []
  for (const section of report.sections.slice(0, 6)) {
    parts.push(`## ${section.title}`)
    for (const row of section.rows.slice(0, maxRows)) {
      parts.push(
        section.columns.map((c) => `${c}: ${row[c] ?? ''}`).join(' | '),
      )
    }
    if (section.rows.length > maxRows) {
      parts.push(`... +${section.rows.length - maxRows} more rows`)
    }
  }
  return parts.join('\n')
}

function ruleBasedNarrative(report: GeneratedReport): string {
  const rows = report.meta.rowCount
  return [
    `${report.meta.title} covers ${report.meta.periodStart} to ${report.meta.periodEnd} (${report.meta.periodDays} days).`,
    `The report contains ${rows} data points across ${report.sections.length} section(s).`,
    'Review attached tables for detail; configure OPENAI_API_KEY for AI-generated executive commentary.',
  ].join(' ')
}

export async function generateReportNarrative(
  tenantId: string,
  report: GeneratedReport,
): Promise<{ narrative: string; model: string; insightId?: string }> {
  const ctx = await buildTenantAiContext(tenantId)
  const tableExcerpt = sectionsToText(report)

  let narrative = ruleBasedNarrative(report)
  const model = getAiModelLabel()

  if (isAiLlmEnabled()) {
    const system = `You are AquaERP analytics writer. Produce an executive narrative (3-5 short paragraphs) for a ${report.meta.reportType} report.
Standards: ${report.meta.standards.join(', ')}. Use numbers from the report excerpt only. End with 3 bullet "Recommended actions".
Do not invent data not in the excerpt or tenant context.`
    const user = `Report: ${report.meta.title}
Period: ${report.meta.periodStart} to ${report.meta.periodEnd}

Tenant context:
${formatTenantContextForPrompt(ctx)}

Report data excerpt:
${tableExcerpt}`

    const llm = await completeWithLlm(system, user, { maxTokens: 800 })
    if (llm) narrative = llm
  }

  const insight = await saveInsight(tenantId, {
    insightType: 'business_brief',
    referenceKey: `report:${report.meta.reportType}`,
    title: `Narrative: ${report.meta.title}`,
    summary: narrative.slice(0, 4000),
    recommendations: [],
    metrics: { reportType: report.meta.reportType, rowCount: report.meta.rowCount },
  })

  return { narrative, model, insightId: insight.id }
}

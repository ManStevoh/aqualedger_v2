import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { generateReport } from '@/lib/modules/analytics/report-generators'
import { generateReportNarrative } from '@/lib/modules/ai/report-narrative'
import { isAiLlmEnabled, getAiModelLabel } from '@/lib/modules/ai/llm'

const schema = z.object({
  reportType: z.string().min(1).max(80),
  periodDays: z.coerce.number().int().min(1).max(365).default(30),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.insights.read')
  const body = await request.json()
  const input = schema.parse(body)

  const report = await generateReport(ctx.tenantId, input.reportType, input.periodDays)
  const result = await generateReportNarrative(ctx.tenantId, report)

  return jsonOk({
    reportType: input.reportType,
    narrative: result.narrative,
    model: result.model,
    aiLlmEnabled: isAiLlmEnabled(),
    modelLabel: getAiModelLabel(),
    insightId: result.insightId,
    meta: report.meta,
  })
}, 'v2/ai/reports/narrative')

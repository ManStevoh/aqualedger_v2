import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { computeDemandForecasts, listDemandForecasts } from '@/lib/modules/ai/service'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
  refresh: z.coerce.boolean().optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.forecast.read')
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.parse({
    days: searchParams.get('days') ?? undefined,
    refresh: searchParams.get('refresh') === 'true' ? true : undefined,
  })

  if (parsed.refresh) {
    await computeDemandForecasts(ctx.tenantId)
  }

  const forecasts = await listDemandForecasts(ctx.tenantId, parsed.days)

  const chartData = forecasts.reduce<
    Record<string, { date: string; predicted_kg: number; confidence_pct: number }[]>
  >((acc, f) => {
    if (!acc[f.species_or_sku]) acc[f.species_or_sku] = []
    acc[f.species_or_sku].push({
      date: String(f.forecast_date).split('T')[0],
      predicted_kg: Number(f.predicted_kg),
      confidence_pct: Number(f.confidence_pct),
    })
    return acc
  }, {})

  return jsonOk({ forecasts, chartData })
}, 'v2/ai/forecast')

export const POST = apiHandler(async () => {
  const ctx = await requirePermission('ai.forecast.write')
  const forecasts = await computeDemandForecasts(ctx.tenantId)
  return jsonOk({ forecasts, computed: forecasts.length }, 201)
}, 'v2/ai/forecast')

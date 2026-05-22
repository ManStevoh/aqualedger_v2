import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getCatchForecast } from '@/lib/modules/fishing-ops/catch-forecast'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.catches.read')
  const days = Number(new URL(request.url).searchParams.get('days') || 30)
  const forecast = await getCatchForecast(ctx.tenantId, days)
  return jsonOk({ forecast })
}, 'v2/fishing-ops/forecast')

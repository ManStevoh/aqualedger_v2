import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getSalesForecast } from '@/lib/modules/crm/sales-forecast'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.read')
  const months = Number(new URL(request.url).searchParams.get('months') || 6)
  const forecast = await getSalesForecast(ctx.tenantId, months)
  return jsonOk({ forecast })
}, 'v2/crm/forecast')

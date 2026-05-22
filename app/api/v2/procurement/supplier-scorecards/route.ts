import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  computeSupplierScorecards,
  listSupplierScorecards,
} from '@/lib/modules/procurement/supplier-scorecard'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.suppliers.read')
  const period = new URL(request.url).searchParams.get('period') || undefined
  const scorecards = await listSupplierScorecards(ctx.tenantId, period ?? undefined)
  return jsonOk({ scorecards })
}, 'v2/procurement/supplier-scorecards')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('procurement.suppliers.write')
  const body = (await request.json()) as { periodMonth?: string }
  const result = await computeSupplierScorecards(ctx.tenantId, body.periodMonth)
  return jsonOk(result)
}, 'v2/procurement/supplier-scorecards')

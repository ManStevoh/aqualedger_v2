import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getOrgChart, listOrgUnits, createOrgUnit } from '@/lib/modules/hr/org-chart'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.read')
  const chart = new URL(request.url).searchParams.get('chart') === '1'
  if (chart) {
    const tree = await getOrgChart(ctx.tenantId)
    return jsonOk({ orgChart: tree })
  }
  const units = await listOrgUnits(ctx.tenantId)
  return jsonOk({ units })
}, 'v2/hr/org-chart')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.write')
  const body = z.object({ name: z.string().min(1), parentId: z.string().optional() }).parse(
    await request.json(),
  )
  const unit = await createOrgUnit(ctx.tenantId, body)
  return jsonOk({ unit }, 201)
}, 'v2/hr/org-chart')

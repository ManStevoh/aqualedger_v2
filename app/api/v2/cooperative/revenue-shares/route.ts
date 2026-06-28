import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { calculateCooperativeShares, listCooperativeShares } from '@/lib/modules/cooperative/revenue-share'
import { execute } from '@/lib/db'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.read')
  const period = new URL(request.url).searchParams.get('period') || undefined
  const shares = await listCooperativeShares(ctx.tenantId, period || undefined)
  return jsonOk({ shares })
}, 'v2/cooperative/revenue-shares')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.write')
  const { periodMonth } = z.object({ periodMonth: z.string().regex(/^\d{4}-\d{2}$/) }).parse(
    await request.json(),
  )
  const result = await calculateCooperativeShares(ctx.tenantId, periodMonth)
  return jsonOk(result)
}, 'v2/cooperative/revenue-shares')

export const PUT = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.crew.write')
  const { periodMonth } = z.object({ periodMonth: z.string().regex(/^\d{4}-\d{2}$/) }).parse(
    await request.json(),
  )
  await execute(
    `UPDATE cooperative_revenue_shares SET status = 'disbursed'
     WHERE tenant_id = ? AND period_month = ?`,
    [ctx.tenantId, periodMonth],
  )
  return jsonOk({ success: true, message: 'Shares disbursed successfully' })
}, 'v2/cooperative/revenue-shares')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listSegmentRules,
  upsertSegmentRule,
  computeRfmSegments,
  getSegmentSummary,
} from '@/lib/modules/crm/segmentation'

const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  segmentKey: z.string().min(1),
  ruleType: z.enum(['rfm', 'order_value', 'species', 'manual']),
  criteria: z.record(z.unknown()).default({}),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.read')
  const { searchParams } = new URL(request.url)
  if (searchParams.get('summary') === '1') {
    const summary = await getSegmentSummary(ctx.tenantId)
    return jsonOk({ summary })
  }
  const rules = await listSegmentRules(ctx.tenantId)
  return jsonOk({ rules })
}, 'v2/crm/segments')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.write')
  const body = await request.json()
  if (body.action === 'compute_rfm') {
    const result = await computeRfmSegments(ctx.tenantId)
    return jsonOk(result)
  }
  const input = ruleSchema.parse(body)
  const id = await upsertSegmentRule(ctx.tenantId, input)
  return jsonOk({ id }, 201)
}, 'v2/crm/segments')

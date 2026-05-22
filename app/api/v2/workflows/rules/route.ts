import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listWorkflowRules, createWorkflowRule } from '@/lib/modules/workflows/service'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  triggerEvent: z.string().min(1).max(100),
  conditions: z.record(z.unknown()).optional(),
  actions: z.array(z.record(z.unknown())).min(1),
  active: z.boolean().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('workflows.read')
  const rules = await listWorkflowRules(ctx.tenantId)
  return jsonOk({ rules })
}, 'v2/workflows/rules')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('workflows.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const rule = await createWorkflowRule(ctx.tenantId, input)
  return jsonOk({ rule }, 201)
}, 'v2/workflows/rules')

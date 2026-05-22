import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { isAiLlmEnabled, getAiModelLabel } from '@/lib/modules/ai/llm'
import {
  generateBusinessBrief,
  generateColdchainReview,
  generateInventoryReview,
  getLatestInsight,
  runTenantAiAutomation,
  type AiInsightType,
} from '@/lib/modules/ai/insights'
import { buildTenantAiContext } from '@/lib/modules/ai/tenant-context'

const postSchema = z.object({
  action: z.enum(['brief', 'coldchain', 'inventory', 'run_all']).default('brief'),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.insights.read')
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'business_brief') as AiInsightType

  const [brief, cold, inventory, tenantCtx] = await Promise.all([
    getLatestInsight(ctx.tenantId, 'business_brief', 'daily'),
    getLatestInsight(ctx.tenantId, 'coldchain_review', 'latest'),
    getLatestInsight(ctx.tenantId, 'inventory_review', 'latest'),
    buildTenantAiContext(ctx.tenantId),
  ])

  return jsonOk({
    aiEnabled: isAiLlmEnabled(),
    model: getAiModelLabel(),
    context: tenantCtx,
    insights: {
      businessBrief: brief,
      coldchainReview: cold,
      inventoryReview: inventory,
    },
    requested: type,
  })
}, 'v2/ai/insights')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('ai.insights.write')
  const body = await request.json()
  const { action } = postSchema.parse(body)

  if (action === 'run_all') {
    const result = await runTenantAiAutomation(ctx.tenantId)
    const brief = await getLatestInsight(ctx.tenantId, 'business_brief', 'daily')
    const cold = await getLatestInsight(ctx.tenantId, 'coldchain_review', 'latest')
    const inventory = await getLatestInsight(ctx.tenantId, 'inventory_review', 'latest')
    return jsonOk({ automation: result, insights: { brief, cold, inventory } }, 201)
  }

  if (action === 'coldchain') {
    const insight = await generateColdchainReview(ctx.tenantId)
    return jsonOk({ insight }, 201)
  }

  if (action === 'inventory') {
    const insight = await generateInventoryReview(ctx.tenantId)
    return jsonOk({ insight }, 201)
  }

  const insight = await generateBusinessBrief(ctx.tenantId)
  return jsonOk({ insight }, 201)
}, 'v2/ai/insights')

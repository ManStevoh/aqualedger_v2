import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { execute, generateId, query } from '@/lib/db'
import { runTenantAiAutomation } from '@/lib/modules/ai/insights'

/** Cron-friendly: run AI models + briefs for one tenant (auth) or all tenants (secret) */
export const POST = apiHandler(async (request: NextRequest) => {
  const cronSecret = process.env.AI_CRON_SECRET?.trim()
  const headerSecret = request.headers.get('x-aquaerp-cron-secret')?.trim()

  let tenantIds: string[] = []

  if (cronSecret && headerSecret === cronSecret) {
    const tenants = await query<{ id: string }>(
      `SELECT id FROM tenants WHERE status = 'active'`,
    )
    tenantIds = tenants.map((t) => t.id)
  } else {
    const ctx = await requirePermission('ai.insights.write')
    tenantIds = [ctx.tenantId]
  }

  const results: { tenantId: string; ok: boolean; error?: string; forecasts?: number }[] = []

  for (const tenantId of tenantIds) {
    const runId = generateId()
    try {
      const out = await runTenantAiAutomation(tenantId)
      await execute(
        `INSERT INTO ai_automation_runs (id, tenant_id, status, forecasts_computed, brief_id)
         VALUES (?, ?, 'success', ?, ?)`,
        [runId, tenantId, out.forecasts, out.briefId],
      )
      results.push({ tenantId, ok: true, forecasts: out.forecasts })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      await execute(
        `INSERT INTO ai_automation_runs (id, tenant_id, status, error_message)
         VALUES (?, ?, 'failed', ?)`,
        [runId, tenantId, msg.slice(0, 500)],
      )
      results.push({ tenantId, ok: false, error: msg })
    }
  }

  return jsonOk({
    processed: results.length,
    succeeded: results.filter((r) => r.ok).length,
    results,
  })
}, 'v2/ai/automation/run')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { execute } from '@/lib/db'

const bodySchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = bodySchema.parse(await request.json())

  const months = body.billingCycle === 'annual' ? 12 : 1
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + months)

  await execute(
    `UPDATE tenants
     SET plan = ?, status = 'active', current_period_start = NOW(), current_period_end = ?, updated_at = NOW()
     WHERE id = ?`,
    [body.plan, periodEnd, ctx.tenantId],
  )

  return jsonOk({
    plan: body.plan,
    status: 'active',
    message: `Plan upgraded to ${body.plan.toUpperCase()} tier`,
  })
}, 'v2/tenant/billing/upgrade-direct')

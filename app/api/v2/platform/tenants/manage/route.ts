import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { execute, queryOne } from '@/lib/db'

const schema = z.object({
  tenantId: z.string(),
  action: z.enum(['set_plan', 'extend_trial', 'set_status']),
  plan: z.enum(['starter', 'professional', 'enterprise']).optional(),
  status: z.enum(['active', 'trial', 'suspended', 'cancelled']).optional(),
  days: z.number().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  await requireSuperAdmin()
  const body = schema.parse(await request.json())

  const tenant = await queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM tenants WHERE id = ?`,
    [body.tenantId],
  )
  if (!tenant) throw new Error('Tenant not found')

  if (body.action === 'set_plan') {
    if (!body.plan) throw new Error('Plan is required')
    await execute(
      `UPDATE tenants SET plan = ?, status = 'active', updated_at = NOW() WHERE id = ?`,
      [body.plan, body.tenantId],
    )
    return jsonOk({ message: `Tenant plan updated to ${body.plan.toUpperCase()}` })
  }

  if (body.action === 'extend_trial') {
    const days = body.days || 14
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + days)

    await execute(
      `UPDATE tenants SET status = 'trial', trial_ends_at = ?, updated_at = NOW() WHERE id = ?`,
      [trialEnd, body.tenantId],
    )
    return jsonOk({ message: `Trial extended by ${days} days for ${tenant.name}` })
  }

  if (body.action === 'set_status') {
    if (!body.status) throw new Error('Status is required')
    await execute(
      `UPDATE tenants SET status = ?, updated_at = NOW() WHERE id = ?`,
      [body.status, body.tenantId],
    )
    return jsonOk({ message: `Tenant status updated to ${body.status}` })
  }

  throw new Error('Invalid action')
}, 'v2/platform/tenants/manage')

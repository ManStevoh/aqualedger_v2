import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requireSuperAdmin } from '@/lib/platform/access'
import { query, queryOne, execute } from '@/lib/db'

export const GET = apiHandler(async () => {
  await requireSuperAdmin()

  const requests = await query<{
    id: string
    tenant_id: string
    tenant_name: string
    tenant_slug: string
    requested_plan: string
    billing_cycle: string
    amount_ksh: number
    payment_method: string
    reference_number: string
    notes: string | null
    status: string
    created_at: string
  }>(
    `SELECT pr.*, t.name as tenant_name, t.slug as tenant_slug
     FROM tenant_payment_requests pr
     JOIN tenants t ON pr.tenant_id = t.id
     ORDER BY CASE WHEN pr.status = 'pending' THEN 0 ELSE 1 END, pr.created_at DESC`,
  )

  return jsonOk({ requests })
}, 'v2/platform/billing/requests')

const actionSchema = z.object({
  requestId: z.string(),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requireSuperAdmin()
  const body = actionSchema.parse(await request.json())

  const reqRow = await queryOne<{
    id: string
    tenant_id: string
    requested_plan: string
    billing_cycle: string
    status: string
  }>(`SELECT * FROM tenant_payment_requests WHERE id = ?`, [body.requestId])

  if (!reqRow) throw new Error('Payment request not found')
  if (reqRow.status !== 'pending') throw new Error(`Request has already been ${reqRow.status}`)

  if (body.action === 'approve') {
    const months = reqRow.billing_cycle === 'annual' ? 12 : 1
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + months)

    await execute(
      `UPDATE tenants
       SET plan = ?, status = 'active', current_period_start = NOW(), current_period_end = ?, updated_at = NOW()
       WHERE id = ?`,
      [reqRow.requested_plan, periodEnd, reqRow.tenant_id],
    )

    await execute(
      `UPDATE tenant_payment_requests
       SET status = 'approved', reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [ctx.userId, body.requestId],
    )

    return jsonOk({ message: 'Payment request approved and tenant plan upgraded' })
  } else {
    await execute(
      `UPDATE tenant_payment_requests
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [ctx.userId, body.rejectionReason || 'Declined by platform super admin', body.requestId],
    )

    return jsonOk({ message: 'Payment request rejected' })
  }
}, 'v2/platform/billing/requests/action')

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { execute, generateId } from '@/lib/db'

const bodySchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
  amountKsh: z.number().positive(),
  paymentMethod: z.enum(['mpesa_paybill', 'bank_transfer', 'cheque', 'manual_other']).default('bank_transfer'),
  referenceNumber: z.string().min(3, 'Payment reference number is required'),
  notes: z.string().optional(),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = bodySchema.parse(await request.json())

  const requestId = generateId()
  await execute(
    `INSERT INTO tenant_payment_requests
     (id, tenant_id, requested_plan, billing_cycle, amount_ksh, payment_method, reference_number, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      requestId,
      ctx.tenantId,
      body.plan,
      body.billingCycle,
      body.amountKsh,
      body.paymentMethod,
      body.referenceNumber.trim(),
      body.notes?.trim() || null,
    ],
  )

  return jsonOk({
    requestId,
    message: 'Manual payment request submitted successfully for Super Admin approval',
  })
}, 'v2/tenant/billing/manual-request')

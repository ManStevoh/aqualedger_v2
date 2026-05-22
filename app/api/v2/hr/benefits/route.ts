import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listBenefitPlans,
  createBenefitPlan,
  listEmployeeBenefits,
  enrollEmployeeBenefit,
} from '@/lib/modules/hr/benefits'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.read')
  const view = new URL(request.url).searchParams.get('view')
  if (view === 'enrollments') {
    const enrollments = await listEmployeeBenefits(ctx.tenantId)
    return jsonOk({ enrollments })
  }
  const plans = await listBenefitPlans(ctx.tenantId)
  return jsonOk({ plans })
}, 'v2/hr/benefits')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('hr.employees.write')
  const body = z
    .object({
      type: z.enum(['plan', 'enrollment']),
      name: z.string().optional(),
      planType: z.string().optional(),
      employeeId: z.string().optional(),
      planId: z.string().optional(),
      enrolledAt: z.string().optional(),
    })
    .parse(await request.json())

  if (body.type === 'enrollment') {
    const enrollment = await enrollEmployeeBenefit(ctx.tenantId, {
      employeeId: body.employeeId!,
      planId: body.planId!,
      enrolledAt: body.enrolledAt ?? new Date().toISOString().split('T')[0],
    })
    return jsonOk({ enrollment }, 201)
  }

  const plan = await createBenefitPlan(ctx.tenantId, {
    name: body.name!,
    planType: body.planType ?? 'health',
  })
  return jsonOk({ plan }, 201)
}, 'v2/hr/benefits')

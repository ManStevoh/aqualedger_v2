import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getPayrollRun, updatePayrollRunStatus } from '@/lib/modules/hr/payroll'

const patchSchema = z.object({
  status: z.enum(['draft', 'approved', 'paid']),
})

export const GET = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('hr.payroll.read')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const run = await getPayrollRun(ctx.tenantId, id)
    if (!run) {
      const { notFound } = await import('@/lib/api-handler')
      throw notFound('Payroll run not found')
    }
    return jsonOk({ payrollRun: run })
  },
  'v2/hr/payroll/[id]',
)

export const PATCH = apiHandler(
  async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('hr.payroll.write')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const body = patchSchema.parse(await request.json())
    const run = await updatePayrollRunStatus(ctx.tenantId, id, body.status)
    return jsonOk({ payrollRun: run })
  },
  'v2/hr/payroll/[id]',
)

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { updateInsuranceClaimStatus } from '@/lib/modules/risk/insurance'

const patchSchema = z.object({
  status: z.enum(['submitted', 'reviewing', 'approved', 'rejected', 'paid']),
  approvedAmount: z.number().min(0).optional().nullable(),
  resolutionNotes: z.string().optional().nullable(),
})

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('risk.insurance.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = patchSchema.parse(await request.json())
  const claim = await updateInsuranceClaimStatus(ctx.tenantId, id, body)
  return jsonOk({ claim })
}, 'v2/risk/insurance/claims/[id]')

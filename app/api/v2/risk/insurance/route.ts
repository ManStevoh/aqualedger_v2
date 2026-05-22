import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listInsurancePolicies,
  createInsurancePolicy,
  listInsuranceClaims,
  createInsuranceClaim,
  getInsuranceSummary,
} from '@/lib/modules/risk/insurance'

const policySchema = z.object({
  type: z.literal('policy'),
  boatId: z.string().uuid().optional().nullable(),
  policyNumber: z.string().min(1).max(80),
  insurerName: z.string().min(1).max(200),
  policyType: z.enum(['hull', 'liability', 'cargo', 'crew', 'comprehensive']),
  premiumAmount: z.number().min(0),
  coverageAmount: z.number().min(0),
  currency: z.string().length(3).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  notes: z.string().optional().nullable(),
})

const claimSchema = z.object({
  type: z.literal('claim'),
  policyId: z.string().uuid(),
  boatId: z.string().uuid().optional().nullable(),
  incidentDate: z.string().min(1),
  description: z.string().min(1).max(5000),
  claimedAmount: z.number().positive(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('risk.insurance.read')
  const { searchParams } = new URL(request.url)
  const resource = searchParams.get('resource') || 'policies'

  if (searchParams.get('summary') === '1') {
    const summary = await getInsuranceSummary(ctx.tenantId)
    return jsonOk({ summary })
  }

  if (resource === 'claims') {
    const data = await listInsuranceClaims(ctx.tenantId, {
      status: searchParams.get('status') ?? undefined,
      policyId: searchParams.get('policy_id') ?? undefined,
      limit: parseInt(searchParams.get('limit') || '50', 10),
    })
    return jsonOk(data)
  }

  const data = await listInsurancePolicies(ctx.tenantId, {
    status: searchParams.get('status') ?? undefined,
    boatId: searchParams.get('boat_id') ?? undefined,
    limit: parseInt(searchParams.get('limit') || '50', 10),
  })
  return jsonOk(data)
}, 'v2/risk/insurance')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('risk.insurance.write')
  const raw = await request.json()
  const discriminated = z.discriminatedUnion('type', [policySchema, claimSchema]).parse(raw)

  if (discriminated.type === 'policy') {
    const policy = await createInsurancePolicy(ctx.tenantId, {
      boatId: discriminated.boatId,
      policyNumber: discriminated.policyNumber,
      insurerName: discriminated.insurerName,
      policyType: discriminated.policyType,
      premiumAmount: discriminated.premiumAmount,
      coverageAmount: discriminated.coverageAmount,
      currency: discriminated.currency,
      startDate: discriminated.startDate,
      endDate: discriminated.endDate,
      notes: discriminated.notes,
    })
    return jsonOk({ policy }, 201)
  }

  const claim = await createInsuranceClaim(ctx.tenantId, {
    policyId: discriminated.policyId,
    boatId: discriminated.boatId,
    incidentDate: discriminated.incidentDate,
    description: discriminated.description,
    claimedAmount: discriminated.claimedAmount,
  })
  return jsonOk({ claim }, 201)
}, 'v2/risk/insurance')

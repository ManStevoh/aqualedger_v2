import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { getTraceabilityChain } from '@/lib/modules/fishing-ops/service'

const querySchema = z.object({
  lotCode: z.string().min(1).max(80),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.traceability.read')
  const { searchParams } = new URL(request.url)
  const { lotCode } = querySchema.parse({
    lotCode: searchParams.get('lotCode') ?? searchParams.get('lot') ?? undefined,
  })

  const chain = await getTraceabilityChain(ctx.tenantId, lotCode)
  return jsonOk({ chain })
}, 'v2/traceability/chain')

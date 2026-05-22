import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listCatchQuotas,
  createCatchQuota,
  getQuotaSummary,
} from '@/lib/modules/fishing/quotas'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  speciesId: z.string().uuid().optional().nullable(),
  fishingZone: z.string().max(120).optional().nullable(),
  periodType: z.enum(['monthly', 'annual']).default('annual'),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  quotaKg: z.number().positive(),
  issuingAuthority: z.string().max(120).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.quotas.read')
  const { searchParams } = new URL(request.url)
  if (searchParams.get('summary') === '1') {
    const summary = await getQuotaSummary(ctx.tenantId)
    return jsonOk({ summary })
  }
  const data = await listCatchQuotas(ctx.tenantId, {
    status: searchParams.get('status') ?? undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '50', 10),
  })
  return jsonOk(data)
}, 'v2/fishing/quotas')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('fishing.quotas.write')
  const body = createSchema.parse(await request.json())
  const quota = await createCatchQuota(ctx.tenantId, {
    name: body.name,
    speciesId: body.speciesId,
    fishingZone: body.fishingZone,
    periodType: body.periodType,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    quotaKg: body.quotaKg,
    issuingAuthority: body.issuingAuthority,
    notes: body.notes,
  })
  return jsonOk({ quota }, 201)
}, 'v2/fishing/quotas')

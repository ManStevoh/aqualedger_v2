import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { updateCatchQuota } from '@/lib/modules/fishing/quotas'

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  speciesId: z.string().uuid().optional().nullable(),
  fishingZone: z.string().max(120).optional().nullable(),
  periodType: z.enum(['monthly', 'annual']).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  quotaKg: z.number().positive().optional(),
  issuingAuthority: z.string().max(120).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
  notes: z.string().optional().nullable(),
})

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('fishing.quotas.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = patchSchema.parse(await request.json())
  const quota = await updateCatchQuota(ctx.tenantId, id, body)
  return jsonOk({ quota })
}, 'v2/fishing/quotas/[id]')

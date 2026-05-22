import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { updateStorageZone, deleteStorageZone } from '@/lib/modules/coldchain/service'

const updateZoneSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(150).optional(),
  targetTempC: z.coerce.number().optional(),
  minTempC: z.coerce.number().nullable().optional(),
  maxTempC: z.coerce.number().nullable().optional(),
  capacityKg: z.coerce.number().nullable().optional(),
  status: z.enum(['active', 'maintenance', 'offline']).optional(),
})

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('coldchain.zones.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = await request.json()
  const input = updateZoneSchema.parse(body)
  const zone = await updateStorageZone(ctx.tenantId, id, input)
  return jsonOk({ zone })
}, 'v2/coldchain/zones/[id]')

export const DELETE = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('coldchain.zones.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  await deleteStorageZone(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/coldchain/zones/[id]')

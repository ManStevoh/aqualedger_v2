import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listIotDevices,
  createIotDevice,
  updateIotDevice,
  rotateDeviceIngestKey,
  type IotDeviceType,
} from '@/lib/modules/integrations/devices'

const createSchema = z.object({
  name: z.string().min(1).max(120),
  deviceType: z.enum([
    'temperature_probe',
    'humidity_sensor',
    'door_sensor',
    'scale',
    'gps_tracker',
    'gateway',
    'barcode_scanner',
    'other',
  ]),
  externalId: z.string().max(100).optional(),
  facilityId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  boatId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
  facilityId: z.string().uuid().nullable().optional(),
  zoneId: z.string().uuid().nullable().optional(),
  boatId: z.string().uuid().nullable().optional(),
  action: z.enum(['rotate_key']).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const type = searchParams.get('type') as IotDeviceType | null

  const result = await listIotDevices(ctx.tenantId, {
    page,
    limit,
    type: type || undefined,
  })
  return jsonOk(result)
}, 'v2/integrations/devices')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const device = await createIotDevice(ctx.tenantId, {
    name: input.name,
    deviceType: input.deviceType,
    externalId: input.externalId,
    facilityId: input.facilityId,
    zoneId: input.zoneId,
    boatId: input.boatId,
    metadata: input.metadata,
  })
  return jsonOk({ device }, 201)
}, 'v2/integrations/devices')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = await request.json()
  const input = patchSchema.parse(body)

  if (input.action === 'rotate_key') {
    const rotated = await rotateDeviceIngestKey(ctx.tenantId, input.id)
    return jsonOk(rotated)
  }

  const device = await updateIotDevice(ctx.tenantId, input.id, {
    name: input.name,
    status: input.status,
    facilityId: input.facilityId,
    zoneId: input.zoneId,
    boatId: input.boatId,
  })
  return jsonOk({ device })
}, 'v2/integrations/devices')

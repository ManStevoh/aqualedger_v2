import { NextRequest } from 'next/server'
import { unauthorized } from '@/lib/api-handler'
import { resolveDeviceByIngestKey, type IotDevice } from './devices'
import { resolveUserTenantId } from '@/lib/modules/tenant/service'
import { queryOne } from '@/lib/db'

export interface IngestContext {
  tenantId: string
  device?: IotDevice
  source: 'device_key' | 'global_secret' | 'jwt'
}

function readHeader(request: NextRequest, name: string): string | null {
  return request.headers.get(name)?.trim() || null
}

/** Machine ingest: X-AquaERP-Device-Key or X-AquaERP-Ingest-Secret + X-Tenant-Id */
export async function resolveIngestContext(request: NextRequest): Promise<IngestContext> {
  const deviceKey = readHeader(request, 'x-aquaerp-device-key')
  if (deviceKey) {
    const device = await resolveDeviceByIngestKey(deviceKey)
    if (!device) throw unauthorized('Invalid device key')
    return { tenantId: device.tenant_id, device, source: 'device_key' }
  }

  const globalSecret = process.env.IOT_GLOBAL_INGEST_SECRET?.trim()
  const providedSecret = readHeader(request, 'x-aquaerp-ingest-secret')
  const tenantHeader = readHeader(request, 'x-tenant-id')

  if (globalSecret && providedSecret && providedSecret === globalSecret) {
    if (!tenantHeader) throw unauthorized('X-Tenant-Id required with global ingest secret')
    const tenant = await queryOne<{ id: string }>(
      `SELECT id FROM tenants WHERE id = ? LIMIT 1`,
      [tenantHeader],
    )
    if (!tenant) throw unauthorized('Unknown tenant')
    return { tenantId: tenant.id, source: 'global_secret' }
  }

  throw unauthorized('Provide X-AquaERP-Device-Key or X-AquaERP-Ingest-Secret + X-Tenant-Id')
}

export async function resolveIngestContextForUser(userId: string): Promise<IngestContext> {
  const tenantId = await resolveUserTenantId(userId)
  return { tenantId, source: 'jwt' }
}

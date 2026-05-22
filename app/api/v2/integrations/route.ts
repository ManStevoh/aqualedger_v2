import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { query } from '@/lib/db'
import { requirePermission } from '@/lib/platform/access'
import { tenantWhere } from '@/lib/tenant'
import {
  connectProvider,
  testProvider,
  type IntegrationProvider,
} from '@/lib/modules/integrations/service'

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('integrations.read')

  const connections = await query(
    `SELECT id, tenant_id, provider, name, status, last_sync_at, created_at, updated_at
     FROM integration_connections
     WHERE ${tenantWhere()}
     ORDER BY provider ASC, name ASC`,
    [ctx.tenantId],
  )

  return jsonOk({ connections })
}, 'v2/integrations')

const postSchema = z.object({
  action: z.enum(['connect', 'test']),
  provider: z.enum(['mpesa', 'stripe', 'sms', 'iot_coldchain']),
})

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = postSchema.parse(await request.json())
  const provider = body.provider as IntegrationProvider

  if (body.action === 'connect') {
    const connection = await connectProvider(ctx.tenantId, provider)
    return jsonOk({ connection }, 201)
  }

  const result = await testProvider(ctx.tenantId, provider)
  return jsonOk(result)
}, 'v2/integrations')

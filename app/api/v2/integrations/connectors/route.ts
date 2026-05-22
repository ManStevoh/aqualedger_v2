import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listConnectors,
  upsertConnector,
  syncConnector,
} from '@/lib/modules/integrations/connectors'

const upsertSchema = z.object({
  connectorType: z.enum(['erp', 'shipping', 'whatsapp', 'accounting']),
  provider: z.string().min(1),
  config: z.record(z.unknown()).optional(),
})

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.read')
  const type = new URL(request.url).searchParams.get('type') as
    | 'erp'
    | 'shipping'
    | 'whatsapp'
    | 'accounting'
    | null
  const connectors = await listConnectors(ctx.tenantId, type ?? undefined)
  return jsonOk({ connectors })
}, 'v2/integrations/connectors')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = await request.json()
  if (body.connectorId && body.action === 'sync') {
    const result = await syncConnector(ctx.tenantId, body.connectorId)
    return jsonOk({ sync: result })
  }
  const input = upsertSchema.parse(body)
  const id = await upsertConnector(ctx.tenantId, input)
  return jsonOk({ id }, 201)
}, 'v2/integrations/connectors')

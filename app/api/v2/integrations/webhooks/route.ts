import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from '@/lib/modules/integrations/service'

const createSchema = z.object({
  url: z.string().url().max(500),
  events: z.array(z.string()).min(1),
  status: z.enum(['active', 'inactive']).optional(),
})

const updateSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url().max(500).optional(),
  events: z.array(z.string()).min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('integrations.read')
  const webhooks = await listWebhooks(ctx.tenantId)
  return jsonOk({ webhooks })
}, 'v2/integrations/webhooks')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = await request.json()
  const input = createSchema.parse(body)
  const webhook = await createWebhook(ctx.tenantId, input)
  return jsonOk({ webhook }, 201)
}, 'v2/integrations/webhooks')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const body = await request.json()
  const { id, ...patch } = updateSchema.parse(body)
  const webhook = await updateWebhook(ctx.tenantId, id, patch)
  return jsonOk({ webhook })
}, 'v2/integrations/webhooks')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('integrations.write')
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) throw new Error('Webhook id is required')
  await deleteWebhook(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/integrations/webhooks')

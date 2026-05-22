import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { campaignUpdateSchema } from '@/lib/modules/crm/schemas'
import { updateCampaign, deleteCampaign } from '@/lib/modules/crm/service'

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('crm.customers.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = campaignUpdateSchema.parse(await request.json())
  const campaign = await updateCampaign(ctx.tenantId, id, body)
  return jsonOk({ campaign })
}, 'v2/crm/campaigns/[id]')

export const DELETE = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('crm.customers.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  await deleteCampaign(ctx.tenantId, id)
  return jsonOk({ deleted: true })
}, 'v2/crm/campaigns/[id]')

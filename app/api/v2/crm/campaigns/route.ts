import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { campaignCreateSchema, campaignListQuerySchema } from '@/lib/modules/crm/schemas'
import { listCampaigns, createCampaign } from '@/lib/modules/crm/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.read')
  const { searchParams } = new URL(request.url)
  const query = campaignListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    channel: searchParams.get('channel') ?? undefined,
  })

  const data = await listCampaigns(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/crm/campaigns')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.write')
  const body = campaignCreateSchema.parse(await request.json())
  const campaign = await createCampaign(ctx.tenantId, body)
  return jsonOk({ campaign }, 201)
}, 'v2/crm/campaigns')

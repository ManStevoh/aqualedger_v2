import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { leadCreateSchema, leadListQuerySchema } from '@/lib/modules/crm/schemas'
import { listLeads, createLead } from '@/lib/modules/crm/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.leads.read')
  const { searchParams } = new URL(request.url)
  const query = leadListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    stage: searchParams.get('stage') ?? undefined,
  })

  const data = await listLeads(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/crm/leads')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.leads.write')
  const body = leadCreateSchema.parse(await request.json())
  const lead = await createLead(ctx.tenantId, body)
  return jsonOk({ lead }, 201)
}, 'v2/crm/leads')

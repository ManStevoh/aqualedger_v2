import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { activityCreateSchema, activityListQuerySchema } from '@/lib/modules/crm/schemas'
import { listActivities, createActivity } from '@/lib/modules/crm/service'

export const GET = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.read')
  const { searchParams } = new URL(request.url)
  const query = activityListQuerySchema.parse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    customerId: searchParams.get('customerId') ?? undefined,
    leadId: searchParams.get('leadId') ?? undefined,
    activityType: searchParams.get('activityType') ?? undefined,
  })

  const data = await listActivities(ctx.tenantId, query)
  return jsonOk(data)
}, 'v2/crm/activities')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('crm.customers.write')
  const body = activityCreateSchema.parse(await request.json())
  const activity = await createActivity(ctx.tenantId, ctx.userId, body)
  return jsonOk({ activity }, 201)
}, 'v2/crm/activities')

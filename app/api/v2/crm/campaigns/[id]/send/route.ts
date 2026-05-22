import { NextRequest } from 'next/server'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { sendCampaign } from '@/lib/modules/crm/service'

export const POST = apiHandler(
  async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const ctx = await requirePermission('crm.customers.write')
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
    const result = await sendCampaign(ctx.tenantId, id)
    return jsonOk(result)
  },
  'v2/crm/campaigns/[id]/send',
)

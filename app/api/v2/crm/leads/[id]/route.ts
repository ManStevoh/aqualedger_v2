import { NextRequest } from 'next/server'
import { apiHandler, jsonOk, notFound } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { leadUpdateSchema } from '@/lib/modules/crm/schemas'
import { getLead, updateLead } from '@/lib/modules/crm/lead-update'

export const GET = apiHandler(async (
  _request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('crm.leads.read')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const lead = await getLead(ctx.tenantId, id)
  if (!lead) throw notFound('Lead not found')
  return jsonOk({ lead })
}, 'v2/crm/leads/[id]')

export const PATCH = apiHandler(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => {
  const ctx = await requirePermission('crm.leads.write')
  const { id } = await (context?.params ?? Promise.resolve({ id: '' }))
  const body = leadUpdateSchema.parse(await request.json())
  const lead = await updateLead(ctx.tenantId, id, body)
  return jsonOk({ lead })
}, 'v2/crm/leads/[id]')

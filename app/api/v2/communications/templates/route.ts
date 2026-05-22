import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import { listTemplates, updateTemplate } from '@/lib/modules/communications/templates'

const patchSchema = z.object({
  id: z.string(),
  subject: z.string().max(255).optional(),
  bodyHtml: z.string().max(50000).optional(),
  bodyText: z.string().max(10000).optional(),
  name: z.string().max(150).optional(),
  active: z.boolean().optional(),
})

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('communications.read')
  const templates = await listTemplates(ctx.tenantId)
  return jsonOk({ templates })
}, 'v2/communications/templates')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('communications.write')
  const body = patchSchema.parse(await request.json())
  const template = await updateTemplate(ctx.tenantId, body.id, {
    subject: body.subject,
    bodyHtml: body.bodyHtml,
    bodyText: body.bodyText,
    name: body.name,
    active: body.active,
  })
  return jsonOk({ template })
}, 'v2/communications/templates')

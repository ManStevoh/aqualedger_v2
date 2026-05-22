import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listCustomDomains,
  addCustomDomain,
  verifyCustomDomain,
} from '@/lib/modules/tenant/custom-domains'

const addSchema = z.object({ domain: z.string().min(3) })
const verifySchema = z.object({ domainId: z.string().uuid() })

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')
  const domains = await listCustomDomains(ctx.tenantId)
  return jsonOk({ domains })
}, 'v2/tenant/domains')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = await request.json()
  if (body.action === 'verify') {
    const input = verifySchema.parse(body)
    const result = await verifyCustomDomain(ctx.tenantId, input.domainId)
    return jsonOk({ domain: result })
  }
  const input = addSchema.parse(body)
  const result = await addCustomDomain(ctx.tenantId, input.domain)
  return jsonOk({ domain: result }, 201)
}, 'v2/tenant/domains')

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { apiHandler, jsonOk, ApiError } from '@/lib/api-handler'
import { requirePermission } from '@/lib/platform/access'
import {
  listCustomDomains,
  addCustomDomain,
  verifyCustomDomain,
  verifyCustomDomainDns,
  removeCustomDomain,
  setPrimaryCustomDomain,
} from '@/lib/modules/tenant/custom-domains'
import { getTenantHostingInfo } from '@/lib/modules/tenant/hosting'

const addSchema = z.object({ domain: z.string().min(3) })
const verifySchema = z.object({ domainId: z.string().min(1) })
const domainIdSchema = z.object({ domainId: z.string().min(1) })

export const GET = apiHandler(async () => {
  const ctx = await requirePermission('tenant.settings.read')
  const [domains, hosting] = await Promise.all([
    listCustomDomains(ctx.tenantId),
    getTenantHostingInfo(ctx.tenantId),
  ])
  return jsonOk({ domains, hosting })
}, 'v2/tenant/domains')

export const POST = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = await request.json()
  if (body.action === 'verify-dns') {
    const input = verifySchema.parse(body)
    const result = await verifyCustomDomainDns(ctx.tenantId, input.domainId)
    return jsonOk({ domain: result })
  }
  if (body.action === 'verify') {
    const input = verifySchema.parse(body)
    const result = await verifyCustomDomain(ctx.tenantId, input.domainId)
    return jsonOk({ domain: result })
  }
  const input = addSchema.parse(body)
  const result = await addCustomDomain(ctx.tenantId, input.domain)
  return jsonOk({ domain: result }, 201)
}, 'v2/tenant/domains')

export const PATCH = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const body = await request.json()
  if (body.action === 'set-primary') {
    const input = domainIdSchema.parse(body)
    const result = await setPrimaryCustomDomain(ctx.tenantId, input.domainId)
    return jsonOk({ domain: result })
  }
  throw new ApiError('Unknown action', 400, 'BAD_REQUEST')
}, 'v2/tenant/domains')

export const DELETE = apiHandler(async (request: NextRequest) => {
  const ctx = await requirePermission('tenant.settings.write')
  const domainId = request.nextUrl.searchParams.get('domainId')
  if (!domainId) {
    return NextResponse.json({ success: false, error: 'domainId required' }, { status: 400 })
  }
  await removeCustomDomain(ctx.tenantId, domainId)
  return jsonOk({ removed: true })
}, 'v2/tenant/domains')

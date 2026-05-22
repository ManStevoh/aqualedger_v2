import { NextRequest, NextResponse } from 'next/server'
import {
  resolveTenantIdByCustomDomain,
  resolveTenantIdBySlug,
  resolveTenantSlugById,
} from '@/lib/platform/tenant-resolve'
import { extractTenantSlugFromHost, isSkippablePlatformHost } from '@/lib/platform/tenant-host'

export const runtime = 'nodejs'

/** Host → tenant (subdomain slug or verified custom domain). Used by middleware. */
export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get('host')
  if (!host) {
    return NextResponse.json({ error: 'host required' }, { status: 400 })
  }

  const hostname = host.split(':')[0].toLowerCase()
  if (isSkippablePlatformHost(hostname)) {
    return NextResponse.json({ tenantId: null, tenantSlug: null, source: null })
  }

  const slugFromHost = extractTenantSlugFromHost(host)
  if (slugFromHost) {
    const tenantId = await resolveTenantIdBySlug(slugFromHost)
    if (tenantId) {
      return NextResponse.json({ tenantId, tenantSlug: slugFromHost, source: 'subdomain' })
    }
  }

  const tenantId = await resolveTenantIdByCustomDomain(hostname)
  if (!tenantId) {
    return NextResponse.json({ tenantId: null, tenantSlug: null, source: null })
  }

  const tenantSlug = await resolveTenantSlugById(tenantId)
  return NextResponse.json({ tenantId, tenantSlug, source: 'custom_domain' })
}

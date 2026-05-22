import { NextRequest, NextResponse } from 'next/server'
import {
  resolveTenantIdByCustomDomain,
  resolveTenantSlugById,
} from '@/lib/platform/tenant-resolve'
import { isSkippablePlatformHost } from '@/lib/platform/tenant-host'

export const runtime = 'nodejs'

/** Edge-safe host → tenant lookup (used by middleware via fetch). */
export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get('host')
  if (!host) {
    return NextResponse.json({ error: 'host required' }, { status: 400 })
  }

  const hostname = host.split(':')[0].toLowerCase()
  if (isSkippablePlatformHost(hostname)) {
    return NextResponse.json({ tenantId: null, tenantSlug: null })
  }

  const tenantId = await resolveTenantIdByCustomDomain(hostname)
  if (!tenantId) {
    return NextResponse.json({ tenantId: null, tenantSlug: null })
  }

  const tenantSlug = await resolveTenantSlugById(tenantId)
  return NextResponse.json({ tenantId, tenantSlug })
}

import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import {
  slugifyOrganizationName,
  validateTenantSlug,
} from '@/lib/platform/tenant-slug'
import { buildTenantSubdomainHost, buildTenantSubdomainOrigin } from '@/lib/platform/tenant-url'

export const runtime = 'nodejs'

/** Public: check if a tenant subdomain slug is available (registration). */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rate = checkRateLimit(`slug-check:${ip}`, 60, 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429 },
    )
  }

  const raw = request.nextUrl.searchParams.get('slug')?.trim() ?? ''
  const fromOrg = request.nextUrl.searchParams.get('organization')?.trim()
  const candidate = raw || (fromOrg ? slugifyOrganizationName(fromOrg) : '')

  if (!candidate) {
    return NextResponse.json({
      success: true,
      data: { available: false, slug: '', error: 'Enter a subdomain to check' },
    })
  }

  const validation = validateTenantSlug(candidate)
  if (!validation.ok) {
    return NextResponse.json({
      success: true,
      data: {
        available: false,
        slug: validation.normalized,
        error: validation.error,
      },
    })
  }

  const taken = await queryOne<{ id: string }>(
    `SELECT id FROM tenants WHERE slug = ? LIMIT 1`,
    [validation.normalized],
  )

  return NextResponse.json({
    success: true,
    data: {
      available: !taken,
      slug: validation.normalized,
      subdomainHost: buildTenantSubdomainHost(validation.normalized),
      subdomainUrl: buildTenantSubdomainOrigin(validation.normalized),
      error: taken ? 'This subdomain is already taken' : undefined,
    },
  })
}

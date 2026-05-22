import { resolveTxt } from 'dns/promises'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound, ApiError } from '@/lib/api-handler'
import { getPlatformHost } from '@/lib/platform/tenant-url'

function normalizeDomainInput(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
}

function assertValidCustomDomain(hostname: string): void {
  if (!hostname || hostname.length < 4 || !hostname.includes('.')) {
    throw new ApiError('Enter a valid domain (e.g. shop.yourcompany.com)', 400, 'INVALID_DOMAIN')
  }
  const platformHost = getPlatformHost()
  if (
    hostname === platformHost ||
    hostname.endsWith(`.${platformHost}`) ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost')
  ) {
    throw new ApiError(
      'Custom domain cannot be the platform domain or a platform subdomain',
      400,
      'INVALID_DOMAIN',
    )
  }
}

export async function listCustomDomains(tenantId: string) {
  return query(
    `SELECT id, tenant_id, domain, verified, primary_domain, verify_token, created_at
     FROM tenant_custom_domains WHERE ${tenantWhere()} ORDER BY created_at DESC`,
    [tenantId],
  )
}

export async function addCustomDomain(tenantId: string, domain: string) {
  const normalized = normalizeDomainInput(domain)
  assertValidCustomDomain(normalized)

  const duplicate = await queryOne<{ id: string }>(
    `SELECT id FROM tenant_custom_domains WHERE domain = ? LIMIT 1`,
    [normalized],
  )
  if (duplicate) {
    throw new ApiError('This domain is already registered on the platform', 409, 'DOMAIN_TAKEN')
  }

  const id = generateId()
  const verifyToken = `aqua-${generateId().slice(0, 12)}`
  await execute(
    `INSERT INTO tenant_custom_domains (id, tenant_id, domain, verified, primary_domain, verify_token)
     VALUES (?, ?, ?, 0, 0, ?)`,
    [id, tenantId, normalized, verifyToken],
  )
  return { id, domain: normalized, verified: false, verifyToken, verify_token: verifyToken }
}

export async function verifyCustomDomain(tenantId: string, domainId: string) {
  const row = await queryOne<{ id: string; domain: string }>(
    `SELECT id, domain FROM tenant_custom_domains WHERE id = ? AND ${tenantWhere()}`,
    [domainId, tenantId],
  )
  if (!row) throw notFound('Domain not found')
  await execute(`UPDATE tenant_custom_domains SET verified = 1 WHERE id = ?`, [domainId])
  return { ...row, verified: true }
}

export async function verifyCustomDomainDns(tenantId: string, domainId: string) {
  const row = await queryOne<{ id: string; domain: string; verify_token: string | null }>(
    `SELECT id, domain, verify_token FROM tenant_custom_domains WHERE id = ? AND ${tenantWhere()}`,
    [domainId, tenantId],
  )
  if (!row) throw notFound('Domain not found')
  if (!row.verify_token) {
    return { ...row, verified: false, dnsVerified: false, message: 'No verify token configured' }
  }

  const lookupHost = `_aquaerp-verify.${row.domain}`
  let txtRecords: string[][]
  try {
    txtRecords = await resolveTxt(lookupHost)
  } catch {
    return { ...row, verified: false, dnsVerified: false, message: 'TXT record not found' }
  }

  const flat = txtRecords.map((parts) => parts.join(''))
  const found = flat.some((txt) => txt.includes(row.verify_token!))
  if (!found) {
    return {
      ...row,
      verified: false,
      dnsVerified: false,
      message: 'Verify token not found in TXT records',
    }
  }

  await execute(`UPDATE tenant_custom_domains SET verified = 1 WHERE id = ?`, [domainId])
  return { ...row, verified: true, dnsVerified: true }
}

export async function removeCustomDomain(tenantId: string, domainId: string): Promise<void> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM tenant_custom_domains WHERE id = ? AND ${tenantWhere()}`,
    [domainId, tenantId],
  )
  if (!row) throw notFound('Domain not found')
  await execute(`DELETE FROM tenant_custom_domains WHERE id = ? AND ${tenantWhere()}`, [
    domainId,
    tenantId,
  ])
}

export async function setPrimaryCustomDomain(
  tenantId: string,
  domainId: string,
): Promise<{ id: string; domain: string }> {
  const row = await queryOne<{ id: string; domain: string; verified: number }>(
    `SELECT id, domain, verified FROM tenant_custom_domains WHERE id = ? AND ${tenantWhere()}`,
    [domainId, tenantId],
  )
  if (!row) throw notFound('Domain not found')
  if (!row.verified) {
    throw new ApiError('Verify DNS before setting as primary domain', 400, 'DOMAIN_NOT_VERIFIED')
  }

  await execute(
    `UPDATE tenant_custom_domains SET primary_domain = 0 WHERE ${tenantWhere()}`,
    [tenantId],
  )
  await execute(
    `UPDATE tenant_custom_domains SET primary_domain = 1 WHERE id = ? AND ${tenantWhere()}`,
    [domainId, tenantId],
  )
  return { id: row.id, domain: row.domain }
}

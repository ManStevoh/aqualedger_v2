import { resolveTxt } from 'dns/promises'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export async function listCustomDomains(tenantId: string) {
  return query(
    `SELECT id, tenant_id, domain, verified, primary_domain, verify_token, created_at
     FROM tenant_custom_domains WHERE ${tenantWhere()} ORDER BY created_at DESC`,
    [tenantId],
  )
}

export async function addCustomDomain(tenantId: string, domain: string) {
  const normalized = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
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

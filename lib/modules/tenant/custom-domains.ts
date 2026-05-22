import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { notFound } from '@/lib/api-handler'

export async function listCustomDomains(tenantId: string) {
  return query(
    `SELECT * FROM tenant_custom_domains WHERE ${tenantWhere()} ORDER BY created_at DESC`,
    [tenantId],
  )
}

export async function addCustomDomain(tenantId: string, domain: string) {
  const normalized = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const id = generateId()
  const verifyToken = `aqua-${generateId().slice(0, 12)}`
  await execute(
    `INSERT INTO tenant_custom_domains (id, tenant_id, domain, verified, primary_domain)
     VALUES (?, ?, ?, 0, 0)`,
    [id, tenantId, normalized],
  )
  return { id, domain: normalized, verified: false, verifyToken }
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

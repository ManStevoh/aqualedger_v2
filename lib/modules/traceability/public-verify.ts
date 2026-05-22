import crypto from 'crypto'
import { query, queryOne, execute, generateId } from '@/lib/db'
import { getTraceabilityReport } from '@/lib/modules/analytics/service'

export function hashLotChain(lotCode: string, tenantId: string, summary: unknown): string {
  return crypto
    .createHash('sha256')
    .update(`${tenantId}:${lotCode}:${JSON.stringify(summary)}`)
    .digest('hex')
}

export async function issueTraceabilityCertificate(tenantId: string, lotCode: string) {
  const lots = await getTraceabilityReport(tenantId)
  const lot = lots.find((l) => l.lot_code === lotCode)
  if (!lot) return null

  const summary = {
    lot_code: lot.lot_code,
    species: lot.species_name,
    vessel: lot.vessel_name,
    landing: lot.landing_site,
    catch_date: lot.catch_date,
    grade: lot.grading,
    msc: lot.msc_certified,
    fao: lot.fao_area,
  }
  const verificationHash = hashLotChain(lotCode, tenantId, summary)

  const existing = await queryOne<{ verification_hash: string }>(
    `SELECT verification_hash FROM traceability_certificates WHERE tenant_id = ? AND lot_code = ?`,
    [tenantId, lotCode],
  )
  if (existing) return { ...summary, verificationHash: existing.verification_hash }

  await execute(
    `INSERT INTO traceability_certificates (id, tenant_id, lot_code, verification_hash, chain_summary)
     VALUES (?, ?, ?, ?, ?)`,
    [generateId(), tenantId, lotCode, verificationHash, JSON.stringify(summary)],
  )

  return { ...summary, verificationHash }
}

export async function verifyByHash(hash: string) {
  return queryOne<{
    lot_code: string
    tenant_id: string
    chain_summary: string
    issued_at: string
    tenant_name: string
  }>(
    `SELECT tc.*, t.name as tenant_name
     FROM traceability_certificates tc
     JOIN tenants t ON tc.tenant_id = t.id
     WHERE tc.verification_hash = ?`,
    [hash],
  )
}

export async function verifyByLotCode(tenantSlug: string, lotCode: string) {
  const tenant = await queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM tenants WHERE slug = ? AND status = 'active'`,
    [tenantSlug],
  )
  if (!tenant) return null
  const cert = await issueTraceabilityCertificate(tenant.id, lotCode)
  if (!cert) return null
  return { tenantName: tenant.name, ...cert }
}

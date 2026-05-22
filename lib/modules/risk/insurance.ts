import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import { resolveTenantId } from '@/lib/tenant'

export interface InsurancePolicyRow {
  id: string
  tenant_id: string
  boat_id: string | null
  policy_number: string
  insurer_name: string
  policy_type: string
  premium_amount: number
  coverage_amount: number
  currency: string
  start_date: string
  end_date: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  boat_name?: string | null
}

export interface InsuranceClaimRow {
  id: string
  tenant_id: string
  policy_id: string
  boat_id: string | null
  claim_number: string
  incident_date: string
  description: string
  claimed_amount: number
  approved_amount: number | null
  status: string
  resolution_notes: string | null
  created_at: string
  updated_at: string
  policy_number?: string
  insurer_name?: string
}

function claimNumber(): string {
  return `CLM-${Date.now().toString(36).toUpperCase()}`
}

export async function listInsurancePolicies(
  tenantId: string,
  opts: { status?: string; boatId?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('p')]
  const params: unknown[] = [tid]
  if (opts.status) {
    conditions.push('p.status = ?')
    params.push(opts.status)
  }
  if (opts.boatId) {
    conditions.push('p.boat_id = ?')
    params.push(opts.boatId)
  }
  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM insurance_policies p ${where}`,
    params,
  )
  const policies = await query<InsurancePolicyRow>(
    `SELECT p.*, b.name as boat_name
     FROM insurance_policies p
     LEFT JOIN boats b ON p.boat_id = b.id
     ${where}
     ORDER BY p.end_date DESC
     ${pagination.clause}`,
    params,
  )
  return {
    policies,
    pagination: {
      page,
      limit,
      total: countRow?.total ?? 0,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit) || 1,
    },
  }
}

export async function createInsurancePolicy(
  tenantId: string,
  input: {
    boatId?: string | null
    policyNumber: string
    insurerName: string
    policyType: 'hull' | 'liability' | 'cargo' | 'crew' | 'comprehensive'
    premiumAmount: number
    coverageAmount: number
    currency?: string
    startDate: string
    endDate: string
    notes?: string | null
  },
): Promise<InsurancePolicyRow> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()
  await execute(
    `INSERT INTO insurance_policies (
      id, tenant_id, boat_id, policy_number, insurer_name, policy_type,
      premium_amount, coverage_amount, currency, start_date, end_date, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.boatId ?? null,
      input.policyNumber,
      input.insurerName,
      input.policyType,
      input.premiumAmount,
      input.coverageAmount,
      input.currency ?? 'KES',
      input.startDate,
      input.endDate,
      input.notes ?? null,
    ],
  )
  const row = await queryOne<InsurancePolicyRow>(
    `SELECT p.*, b.name as boat_name FROM insurance_policies p
     LEFT JOIN boats b ON p.boat_id = b.id WHERE p.id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to create policy')
  return row
}

export async function listInsuranceClaims(
  tenantId: string,
  opts: { status?: string; policyId?: string; page?: number; limit?: number } = {},
) {
  const tid = resolveTenantId(tenantId)
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('c')]
  const params: unknown[] = [tid]
  if (opts.status) {
    conditions.push('c.status = ?')
    params.push(opts.status)
  }
  if (opts.policyId) {
    conditions.push('c.policy_id = ?')
    params.push(opts.policyId)
  }
  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM insurance_claims c ${where}`,
    params,
  )
  const claims = await query<InsuranceClaimRow>(
    `SELECT c.*, p.policy_number, p.insurer_name
     FROM insurance_claims c
     INNER JOIN insurance_policies p ON c.policy_id = p.id
     ${where}
     ORDER BY c.created_at DESC
     ${pagination.clause}`,
    params,
  )
  return {
    claims,
    pagination: {
      page,
      limit,
      total: countRow?.total ?? 0,
      totalPages: Math.ceil((countRow?.total ?? 0) / limit) || 1,
    },
  }
}

export async function createInsuranceClaim(
  tenantId: string,
  input: {
    policyId: string
    boatId?: string | null
    incidentDate: string
    description: string
    claimedAmount: number
  },
): Promise<InsuranceClaimRow> {
  const tid = resolveTenantId(tenantId)
  const policy = await queryOne<{ id: string }>(
    `SELECT id FROM insurance_policies WHERE id = ? AND ${tenantWhere()}`,
    [input.policyId, tid],
  )
  if (!policy) throw notFound('Policy not found')

  const id = generateId()
  const number = claimNumber()
  await execute(
    `INSERT INTO insurance_claims (
      id, tenant_id, policy_id, boat_id, claim_number, incident_date, description, claimed_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.policyId,
      input.boatId ?? null,
      number,
      input.incidentDate,
      input.description,
      input.claimedAmount,
    ],
  )
  const row = await queryOne<InsuranceClaimRow>(
    `SELECT c.*, p.policy_number, p.insurer_name FROM insurance_claims c
     INNER JOIN insurance_policies p ON c.policy_id = p.id WHERE c.id = ?`,
    [id],
  )
  if (!row) throw new Error('Failed to create claim')
  return row
}

export async function updateInsuranceClaimStatus(
  tenantId: string,
  claimId: string,
  input: {
    status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'paid'
    approvedAmount?: number | null
    resolutionNotes?: string | null
  },
): Promise<InsuranceClaimRow> {
  const tid = resolveTenantId(tenantId)
  await execute(
    `UPDATE insurance_claims SET status = ?, approved_amount = ?, resolution_notes = ?, updated_at = NOW()
     WHERE id = ? AND ${tenantWhere()}`,
    [
      input.status,
      input.approvedAmount ?? null,
      input.resolutionNotes ?? null,
      claimId,
      tid,
    ],
  )
  const row = await queryOne<InsuranceClaimRow>(
    `SELECT c.*, p.policy_number, p.insurer_name FROM insurance_claims c
     INNER JOIN insurance_policies p ON c.policy_id = p.id WHERE c.id = ?`,
    [claimId],
  )
  if (!row) throw notFound('Claim not found')
  return row
}

export async function getInsuranceSummary(tenantId: string) {
  const tid = resolveTenantId(tenantId)
  const [policies] = await query<{ active: number; expiring: number; total_coverage: number }>(
    `SELECT
      SUM(status = 'active') as active,
      SUM(status = 'active' AND end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)) as expiring,
      COALESCE(SUM(CASE WHEN status = 'active' THEN coverage_amount ELSE 0 END), 0) as total_coverage
     FROM insurance_policies WHERE ${tenantWhere()}`,
    [tid],
  )
  const [claims] = await query<{ open_claims: number; open_value: number }>(
    `SELECT
      COUNT(*) as open_claims,
      COALESCE(SUM(claimed_amount), 0) as open_value
     FROM insurance_claims WHERE ${tenantWhere()} AND status IN ('submitted', 'reviewing')`,
    [tid],
  )
  return {
    activePolicies: Number(policies?.active ?? 0),
    expiringSoon: Number(policies?.expiring ?? 0),
    totalCoverage: Number(policies?.total_coverage ?? 0),
    openClaims: Number(claims?.open_claims ?? 0),
    openClaimValue: Number(claims?.open_value ?? 0),
  }
}

import { query, queryOne, execute, generateId, buildPagination } from '@/lib/db'
import { notFound } from '@/lib/api-handler'
import { tenantWhere } from '@/lib/tenant'
import { resolveTenantId } from '@/lib/tenant'

export interface CatchQuotaRow {
  id: string
  tenant_id: string
  name: string
  species_id: string | null
  fishing_zone: string | null
  period_type: string
  period_start: string
  period_end: string
  quota_kg: number
  issuing_authority: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CatchQuotaWithUsage extends CatchQuotaRow {
  used_kg: number
  remaining_kg: number
  utilization_pct: number
  species_name?: string | null
}

export async function computeQuotaUsedKg(
  tenantId: string,
  quota: Pick<CatchQuotaRow, 'species_id' | 'fishing_zone' | 'period_start' | 'period_end'>,
): Promise<number> {
  const conditions = [
    'c.tenant_id = ?',
    'c.recorded_at >= ?',
    'c.recorded_at < DATE_ADD(?, INTERVAL 1 DAY)',
  ]
  const params: unknown[] = [tenantId, quota.period_start, quota.period_end]

  if (quota.species_id) {
    conditions.push('c.species_id = ?')
    params.push(quota.species_id)
  }
  if (quota.fishing_zone) {
    conditions.push('t.fishing_zone = ?')
    params.push(quota.fishing_zone)
  }

  const [row] = await query<{ used_kg: number }>(
    `SELECT COALESCE(SUM(c.quantity_kg), 0) as used_kg
     FROM catches c
     INNER JOIN fishing_trips t ON c.trip_id = t.id
     WHERE ${conditions.join(' AND ')}`,
    params,
  )
  return Number(row?.used_kg ?? 0)
}

export async function listCatchQuotas(
  tenantId: string,
  opts: { status?: string; page?: number; limit?: number } = {},
): Promise<{ quotas: CatchQuotaWithUsage[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const tid = resolveTenantId(tenantId)
  const page = opts.page ?? 1
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100)
  const pagination = buildPagination(page, limit)
  const conditions = [tenantWhere('q')]
  const params: unknown[] = [tid]
  if (opts.status) {
    conditions.push('q.status = ?')
    params.push(opts.status)
  }
  const where = `WHERE ${conditions.join(' AND ')}`

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) as total FROM catch_quotas q ${where}`,
    params,
  )
  const total = countRow?.total ?? 0

  const rows = await query<CatchQuotaRow & { species_name: string | null }>(
    `SELECT q.*, fs.name as species_name
     FROM catch_quotas q
     LEFT JOIN fish_species fs ON q.species_id = fs.id
     ${where}
     ORDER BY q.period_end DESC
     ${pagination.clause}`,
    params,
  )

  const quotas: CatchQuotaWithUsage[] = []
  for (const row of rows) {
    const used_kg = await computeQuotaUsedKg(tid, row)
    const quota_kg = Number(row.quota_kg)
    const remaining_kg = Math.max(0, quota_kg - used_kg)
    quotas.push({
      ...row,
      used_kg,
      remaining_kg,
      utilization_pct: quota_kg > 0 ? Math.round((used_kg / quota_kg) * 1000) / 10 : 0,
    })
  }

  return {
    quotas,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export async function createCatchQuota(
  tenantId: string,
  input: {
    name: string
    speciesId?: string | null
    fishingZone?: string | null
    periodType: 'monthly' | 'annual'
    periodStart: string
    periodEnd: string
    quotaKg: number
    issuingAuthority?: string | null
    notes?: string | null
  },
): Promise<CatchQuotaWithUsage> {
  const tid = resolveTenantId(tenantId)
  const id = generateId()
  await execute(
    `INSERT INTO catch_quotas (
      id, tenant_id, name, species_id, fishing_zone, period_type,
      period_start, period_end, quota_kg, issuing_authority, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tid,
      input.name,
      input.speciesId ?? null,
      input.fishingZone ?? null,
      input.periodType,
      input.periodStart,
      input.periodEnd,
      input.quotaKg,
      input.issuingAuthority ?? null,
      input.notes ?? null,
    ],
  )
  const list = await listCatchQuotas(tid, { limit: 1 })
  const created = list.quotas.find((q) => q.id === id)
  if (!created) throw new Error('Failed to create quota')
  return created
}

export async function updateCatchQuota(
  tenantId: string,
  quotaId: string,
  input: Partial<{
    name: string
    speciesId: string | null
    fishingZone: string | null
    periodType: 'monthly' | 'annual'
    periodStart: string
    periodEnd: string
    quotaKg: number
    issuingAuthority: string | null
    status: 'active' | 'inactive'
    notes: string | null
  }>,
): Promise<CatchQuotaWithUsage> {
  const tid = resolveTenantId(tenantId)
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM catch_quotas WHERE id = ? AND ${tenantWhere()}`,
    [quotaId, tid],
  )
  if (!existing) throw notFound('Quota not found')

  const map: Record<string, [string, unknown]> = {
    name: ['name = ?', input.name],
    speciesId: ['species_id = ?', input.speciesId],
    fishingZone: ['fishing_zone = ?', input.fishingZone],
    periodType: ['period_type = ?', input.periodType],
    periodStart: ['period_start = ?', input.periodStart],
    periodEnd: ['period_end = ?', input.periodEnd],
    quotaKg: ['quota_kg = ?', input.quotaKg],
    issuingAuthority: ['issuing_authority = ?', input.issuingAuthority],
    status: ['status = ?', input.status],
    notes: ['notes = ?', input.notes],
  }

  const sets: string[] = []
  const params: unknown[] = []
  for (const [key, [sql, val]] of Object.entries(map)) {
    if ((input as Record<string, unknown>)[key] !== undefined) {
      sets.push(sql)
      params.push(val)
    }
  }
  if (sets.length > 0) {
    sets.push('updated_at = NOW()')
    params.push(quotaId, tid)
    await execute(
      `UPDATE catch_quotas SET ${sets.join(', ')} WHERE id = ? AND ${tenantWhere()}`,
      params,
    )
  }

  const list = await listCatchQuotas(tid, { limit: 100 })
  const updated = list.quotas.find((q) => q.id === quotaId)
  if (!updated) throw notFound('Quota not found')
  return updated
}

export async function getQuotaSummary(tenantId: string) {
  const { quotas } = await listCatchQuotas(tenantId, { status: 'active', limit: 100 })
  const atRisk = quotas.filter((q) => q.utilization_pct >= 85)
  const over = quotas.filter((q) => q.used_kg > q.quota_kg)
  return {
    active: quotas.length,
    atRisk: atRisk.length,
    overLimit: over.length,
    totalQuotaKg: quotas.reduce((s, q) => s + Number(q.quota_kg), 0),
    totalUsedKg: quotas.reduce((s, q) => s + q.used_kg, 0),
  }
}
